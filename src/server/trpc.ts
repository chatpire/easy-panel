import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type SessionData } from "@/server/lucia";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import { UserRoles } from "@/schema/user.schema";
import { getSessionData } from "@/server/auth";
import { env } from "@/env";

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  session: SessionData | null;
}

/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createServerSideHelpers` where we don't have `req`/`res`
 *
 * @link https://trpc.io/docs/v11/context#inner-and-outer-context
 */
export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    db,
    session: opts?.session ?? null,
  };
}

interface CreateTRPCContextOptions extends Partial<CreateNextContextOptions> {
  fromServerComponent: boolean;
  headers: Headers;
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  const session = await getSessionData();

  const contextInner = await createContextInner({ session });

  return {
    ...contextInner,
    // both req and res are undefined, for that client side only transimit the headers
    // req: opts.req,
    // res: opts.res,
    headers: opts.headers,
    fromServerComponent: opts.fromServerComponent,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const _publicProcedure = t.procedure;

export const publicProcedure = _publicProcedure.use(async (opts) => {
  if (!env.TRPC_TIME_LOGGING) return await opts.next();

  const start = Date.now();
  const result = await opts.next();
  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  result.ok ? console.log(`TRPC OK: ${durationMs} ms -`, meta.path) : console.error(`TRPC Non-OK: ${durationMs}`, meta.path);

  return result;
});

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.userAttr) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.userAttr.role !== UserRoles.ADMIN) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

const withUserSchema = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.userAttr) throw new TRPCError({ code: "UNAUTHORIZED" });
  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, ctx.session.userAttr.id),
  });

  if (!user) throw new TRPCError({ code: "NOT_FOUND" });
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user,
    },
  });
});

export const protectedWithUserProcedure = protectedProcedure.use(withUserSchema);

export const adminWithUserProcedure = adminProcedure.use(withUserSchema);
