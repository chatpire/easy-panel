import { NextResponse, type NextRequest } from "next/server";
import { createAuthMiddleware, createRouter, extendRouter, setRouterContext } from "./hono-router";
import { db } from "@/server/db";
import { and, eq } from "drizzle-orm";
import { serviceInstances } from "@/server/db/schema";
import { type PoekmonSharedInstanceData } from "@/schema/service/poekmon-shared.schema";

const handler = async (req: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) => {
  const { instanceId, slug } = params;

  const basePath = `/api/external/poekmon-shared/${params.instanceId}`;

  const instance = await db.query.serviceInstances.findFirst({
    where: and(eq(serviceInstances.id, instanceId), eq(serviceInstances.type, "POEKMON_SHARED")),
  });
  if (!instance) {
    return NextResponse.json({ detail: "Instance Not Found" }, { status: 404 });
  }

  const instanceData = instance.data as PoekmonSharedInstanceData;

  const router = createRouter(basePath);
  router.use(createAuthMiddleware(instanceData.secret));

  setRouterContext(router, {
    instanceId,
    instanceData,
  });

  extendRouter(router);

  return await router.fetch(req);
};

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as OPTIONS };
