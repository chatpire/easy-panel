import { createCallerFactory, createTRPCRouter } from "@/server/trpc";
import { userRouter } from "./routers/user";
import { serviceInstanceRouter } from "./routers/serviceInstance";
import { resourceLogRouter } from "./routers/resourceLog";
import { authRouter } from "./routers/auth";
import { eventLogRouter } from "./routers/eventLog";
import { userInstanceAbilityRouter } from "./routers/userInstanceAbility";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  user: userRouter,
  resourceLog: resourceLogRouter,
  eventLog: eventLogRouter,
  serviceInstance: serviceInstanceRouter,
  userInstanceAbility: userInstanceAbilityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
