import { writeChatgptSharedOAuthLog } from "@/server/actions/write-event-log";
import { db } from "@/server/db";
import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const content = await request.text();
  const urlParams = new URLSearchParams(content);
  const userToken = urlParams.get("userToken");
  const userIp = urlParams.get("userIp");
  const requestIp = request.ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for");
  const { instanceId } = params;

  console.debug("Request IP:", requestIp);
  console.debug("User IP:", userIp);
  console.debug("User Token:", userToken);
  console.debug("Instance ID:", instanceId);

  console.debug("Request content:", content);

  if (!userToken || !instanceId) {
    return NextResponse.json({ code: 0, msg: "Server Error: Missing required parameters" }, { status: 400 });
  }

  try {
    const userId = await api.userInstanceAbility.verifyUserAbility({
      instanceId,
      userToken,
      requestIp,
      userIp,
    });
    await writeChatgptSharedOAuthLog(db, userId, instanceId, userIp, requestIp);

    return NextResponse.json({ code: 1 }, { status: 200 });
  } catch (e) {
    if (e instanceof TRPCError) {
      return NextResponse.json({ code: 0, msg: e.message }, { status: 401 });
    } else {
      console.error(e);
      return NextResponse.json({ code: 0, msg: "Internal server error" }, { status: 500 });
    }
  }
}
