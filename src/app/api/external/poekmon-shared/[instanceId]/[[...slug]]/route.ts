import { NextResponse, type NextRequest } from "next/server";
import { createAuthMiddleware, createRouter } from "./hono-router";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { serviceInstances } from "@/server/db/schema";
import { type PoekmonSharedInstanceData } from "@/schema/service/poekmon-shared.schema";
import { Hono } from "hono";

const handler = async (req: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) => {
  const { instanceId, slug } = params;

  const instance = await db.query.serviceInstances.findFirst({
    where: and(eq(serviceInstances.id, instanceId), eq(serviceInstances.type, "POEKMON_SHARED")),
  });
  if (!instance) {
    return NextResponse.json({ detail: "Instance Not Found" }, { status: 404 });
  }

  const instanceData = instance.data as PoekmonSharedInstanceData;

  const authMiddleware = createAuthMiddleware(instanceData.secret);

  const router = createRouter(`/api/external/poekmon-shared/${params.instanceId}`);

  router.use(authMiddleware);

  router.use(async (c, next) => {
    c.set("instanceId", instanceId);
    c.set("instanceData", instanceData);
    await next();
  });

  return await router.fetch(req);
};

export { handler as GET, handler as POST, handler as PATCH, handler as CREATE, handler as DELETE };
