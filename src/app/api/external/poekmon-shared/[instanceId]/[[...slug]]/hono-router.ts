import { db } from "@/server/db";
import { serviceInstances, userInstanceAbilities } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import {
  PoekmonSharedAccountSchema,
  type PoekmonSharedInstanceData,
  type PoekmonSharedUserInstanceData,
} from "@/schema/service/poekmon-shared.schema";
import { UserDataModel, PoeAccountDataModel, UserData } from "./models";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { env } from "@/env";
import { createMiddleware } from "hono/factory";

type Variables = {
  instanceId: string;
  instanceData: PoekmonSharedInstanceData;
};

const ResponseDataSchema = z.object({
  message: z.string().optional(),
  content: z.unknown().nullable(),
});

const responseDataSchema = (schema: z.ZodSchema) => {
  return ResponseDataSchema.merge(
    z.object({
      content: schema,
    }),
  );
};

type ResponseData = z.infer<typeof ResponseDataSchema>;

const ok = (content?: unknown): ResponseData => ({
  content,
});

const err = (message?: string): ResponseData => ({
  message,
  content: null,
});

export const createRouter = (basePath: string) => {
  const router = new OpenAPIHono<{ Variables: Variables }>({
    defaultHook: (result, c) => {
      if (!result.success) {
        console.error(result);
        return c.json(err("Validation failed: " + String(result)), 422);
      }
    },
  }).basePath(basePath);

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
  });
  router.openapi(pingRoute, (c) => {
    return c.json(ok("pong"));
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
            schema: responseDataSchema(UserDataModel),
          },
        },
        description: "User data",
      },
      404: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("Not Found")),
          },
        },
        description: "Not Found",
      },
      403: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("Denied")),
          },
        },
        description: "Denied",
      },
      500: {
        content: {
          "application/json": {
            schema: responseDataSchema(z.literal("No Data")),
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
    if (!ability) return c.json(err("Not Found"), 404);
    if (!ability.canUse) return c.json(err("Denied"), 403);
    if (!ability.data) return c.json(err("No Data"), 500);
    if (ability.data.type !== "POEKMON_SHARED") return c.json(err("Invalid Data"), 500);
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
        description: "ok",
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
    await db
      .update(userInstanceAbilities)
      .set({ data: abilityData })
      .where(and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, c.var.instanceId)));
    return c.json(ok());
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
        description: "ok",
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
    return c.json(ok());
  });

  const healthReportRoute = createRoute({
    method: "post",
    path: "/report",
    operationId: "healthReport",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              poekmon_version: z.string(),
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
        description: "ok",
      },
    },
  });

  router.openapi(healthReportRoute, async (c) => {
    const data = c.req.valid("json");
    console.log("Poekmon reported version", data.poekmon_version);
    return c.json(ok(null));
  });

  if (env.NODE_ENV === "development") {
    console.log("OpenAPI spec available at /api/external/poekmon-shared/[instanceId]/doc");
    router.doc("/doc", {
      openapi: "3.0.0",
      info: {
        version: "0.1.0",
        title: "Poekmon Panel API",
      },
    });
  }

  return router;
};

export const createAuthMiddleware = (secret: string) => {
  return createMiddleware(async (c, next) => {
    console.log(c.req.path);
    if (c.req.path.endsWith("/doc")) {
      return next();
    }
    const authSecret = c.req.header("Authorization")?.replace("Bearer ", "");
    if (authSecret !== secret) {
      return c.json(err("Unauthorized"), 401);
    }
    await next();
  });
};
