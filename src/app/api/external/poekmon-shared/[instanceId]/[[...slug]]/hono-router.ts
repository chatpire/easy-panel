import { db } from "@/server/db";
import { eventLogs, resourceUsageLogs, serviceInstances, userInstanceAbilities } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import {
  type PoekmonSharedResourceUsageLogDetails,
  type PoekmonSharedInstanceData,
  type PoekmonSharedUserInstanceData,
} from "@/schema/service/poekmon-shared.schema";
import { UserDataModel, PoeAccountDataModel, type UserData, ChatLogContentModel } from "./models";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { env } from "@/env";
import { createMiddleware } from "hono/factory";
import { createCUID } from "@/lib/cuid";
import { ServiceTypeSchema } from "@/server/db/enum";
import { writePoekmonSharedAuthLog } from "@/server/actions/write-event-log";
import { swaggerUI } from "@hono/swagger-ui";

type Variables = {
  instanceId: string;
  instanceData: PoekmonSharedInstanceData;
};

const ResponseDataSchema = z.object({
  message: z.string().optional(),
  content: z.unknown().nullable(),
});

function responseDataSchema<T extends z.ZodType<any>>(schema: T, name?: string) {
  const resultSchema = z.object({
    message: z.string().optional(),
    content: schema,
  });
  if (name) {
    resultSchema.openapi(name);
  }
  return resultSchema;
}

type ResponseData = z.infer<typeof ResponseDataSchema>;

const ok = (content?: unknown): ResponseData => ({
  content: content ?? null,
});

const err = (message?: string): ResponseData => ({
  message,
  content: null,
});

export type Router = ReturnType<typeof createRouter>;

export const createRouter = (basePath: string) => {
  const router = new OpenAPIHono<{ Variables: Variables }>({
    defaultHook: (result, c) => {
      if (!result.success) {
        console.error(result);
        return c.json(err("Validation failed: " + String(result)), 422);
      }
    },
  }).basePath(basePath);

  router.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  return router;
};

export const setRouterContext = (router: Router, variables: Partial<Variables>) => {
  router.use(async (c, next) => {
    if (variables.instanceId) c.set("instanceId", variables.instanceId);
    if (variables.instanceData) c.set("instanceData", variables.instanceData);
    await next();
  });

  return router;
};

export const extendRouter = (router: Router) => {
  const ParamUserIdSchema = z.object({
    userId: z.string().openapi({
      param: {
        name: "userId",
        in: "path",
      },
    }),
  });

  const pingRoute = createRoute({
    method: "get",
    path: "/ping",
    operationId: "ping",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("pong")),
          },
        },
        description: "pong",
      },
    },
    security: [{ Bearer: [] }],
  });
  router.openapi(pingRoute, (c) => {
    return c.json(ok("pong"));
  });

  const authenticateUserRoute = createRoute({
    method: "get",
    path: "/auth/{userId}",
    operationId: "authenticateUser",
    request: {
      params: ParamUserIdSchema,
      body: {
        content: {
          "application/json": {
            schema: z.object({
              token: z.string(),
              user_ip: z.string().nullable(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.null()),
          },
        },
        description: "success",
      },
      403: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("Denied")),
          },
        },
        description: "Denied",
      },
    },
    security: [{ Bearer: [] }],
  });

  router.openapi(authenticateUserRoute, async (c) => {
    const userId = c.req.param("userId");
    const data = c.req.valid("json");
    const ability = await db.query.userInstanceAbilities.findFirst({
      where: and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, c.var.instanceId)),
    });
    if (!ability) return c.json(err("User instance ability not exist"), 403);
    if (!ability.canUse) return c.json(err("Permission Denied"), 403);
    if (data.token !== ability.token) return c.json(err("Denied"), 403);
    await writePoekmonSharedAuthLog(db, userId, c.var.instanceId, data.user_ip, c.req.header("X-Real-IP") ?? null);

    return c.json(ok(null));
  });

  const getUserDataRoute = createRoute({
    method: "get",
    path: "/user/{userId}",
    operationId: "getUserData",
    request: {
      params: ParamUserIdSchema,
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(UserDataModel, "UserDataResponse"),
          },
        },
        description: "User data",
      },
      403: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.string()),
          },
        },
        description: "Denied",
      },
      500: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.string()),
          },
        },
        description: "No Data",
      },
    },
  });

  router.openapi(getUserDataRoute, async (c) => {
    const userId = c.req.param("userId");
    const ability = await db.query.userInstanceAbilities.findFirst({
      where: and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, c.var.instanceId)),
    });
    if (!ability) return c.json(err("Not Found"), 403);
    if (!ability.canUse) return c.json(err("Denied"), 403);
    if (ability.data?.type !== "POEKMON_SHARED") {
      console.error("Invalid Ability Data Type", ability);
      return c.json(err("Invalid Data Type"), 500);
    }
    return c.json(ok(ability.data as UserData));
  });

  const updateUserDataRoute = createRoute({
    method: "post",
    path: "/user/{userId}",
    operationId: "updateUserData",
    request: {
      params: ParamUserIdSchema,
      body: {
        content: {
          "application/json": {
            schema: UserDataModel,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.null()),
          },
        },
        description: "success",
      },
      400: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("Error Update")),
          },
        },
        description: "Error Update",
      },
    },
  });

  router.openapi(updateUserDataRoute, async (c) => {
    const userId = c.req.param("userId");
    const data = c.req.valid("json");
    const abilityData = {
      type: "POEKMON_SHARED",
      ...data,
    } as PoekmonSharedUserInstanceData;
    const result = await db
      .update(userInstanceAbilities)
      .set({ data: abilityData })
      .where(and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, c.var.instanceId)))
      .returning({ userId: userInstanceAbilities.userId, instanceId: userInstanceAbilities.instanceId });
    if (result.length !== 1) {
      return c.json(err(`Error Update: ${result.length} userInstanceAbilities returned`), 400);
    }
    return c.json(ok(null));
  });

  const updatePoeAccountDataRoute = createRoute({
    method: "post",
    path: "/poe-account",
    operationId: "updatePoeAccountData",
    request: {
      body: {
        content: {
          "application/json": {
            schema: PoeAccountDataModel,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.null()),
          },
        },
        description: "success",
      },
      400: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("Error Update")),
          },
        },
        description: "Error Update",
      },
    },
  });

  router.openapi(updatePoeAccountDataRoute, async (c) => {
    const data = c.req.valid("json");

    const instanceData = c.var.instanceData;
    const instance = await db
      .update(serviceInstances)
      .set({
        data: {
          ...instanceData,
          poe_account: data,
        } as PoekmonSharedInstanceData,
      })
      .where(eq(serviceInstances.id, c.var.instanceId))
      .returning();
    if (instance.length !== 1) {
      return c.json(err(`Error Update: ${instance.length} instance returned`), 400);
    }
    c.set("instanceData", instance[0]!.data as PoekmonSharedInstanceData);
    return c.json(ok(null));
  });

  const createLogRoute = createRoute({
    method: "post",
    path: "/log",
    operationId: "createLog",
    request: {
      body: {
        content: {
          "application/json": {
            schema: ChatLogContentModel,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.null()),
          },
        },
        description: "success",
      },
    },
  });

  router.openapi(createLogRoute, async (c) => {
    const data = c.req.valid("json");
    const logDetail = {
      type: "POEKMON_SHARED",
      ...data,
    } as PoekmonSharedResourceUsageLogDetails;

    await db.transaction(async (tx) => {
      await tx.insert(resourceUsageLogs).values({
        id: createCUID(),
        userId: data.user_id,
        instanceId: c.var.instanceId,
        type: ServiceTypeSchema.Values.POEKMON_SHARED,
        details: logDetail,
        createdAt: new Date(),
      });

      if (logDetail.status === "success") {
        const instance = await tx.query.serviceInstances.findFirst({
          where: eq(serviceInstances.id, c.var.instanceId),
        });
        const instanceData = instance!.data as PoekmonSharedInstanceData;
        if (instanceData.poe_account.account_info !== null) {
          instanceData.poe_account.account_info.message_point_balance -= logDetail.consume_point;
        }
        await tx
          .update(serviceInstances)
          .set({
            data: instanceData,
          })
          .where(eq(serviceInstances.id, c.var.instanceId));
      }
    });

    return c.json(ok());
  });

  if (env.NODE_ENV === "development") {
    router.doc("/doc", {
      openapi: "3.0.0",
      info: {
        version: "0.1.0",
        title: "Poekmon Panel API",
      },
    });
    router.get("/swagger", swaggerUI({ url: "./doc" }));
  }
};

export const createAuthMiddleware = (secret: string) => {
  return createMiddleware(async (c, next) => {
    // console.log(c.req.path);
    if (c.req.path.endsWith("/doc") || c.req.path.endsWith("/swagger")) {
      return next();
    }
    const authSecret = c.req.header("Authorization")?.replace("Bearer ", "");
    if (authSecret !== secret) {
      return c.json(err("Unauthorized"), 401);
    }
    await next();
  });
};
