import { writeChatResourceUsageLog } from "@/server/actions/write-resource-usage-log";
import { db } from "@/server/db";
import { userInstanceAbilities } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ServiceTypeSchema } from "@/server/db/enum";

export const dynamic = "force-dynamic";

const createLimitMessage = (message?: string, clearsIn?: number) => {
  return {
    detail: {
      clears_in: clearsIn ?? 252,
      code: "model_cap_exceeded",
      message: message ?? "You have sent too many messages to the model. Please try again later.",
    },
  };
};

const ChatgptCompletionRequestSchema = z.object({
  action: z.string(), // next, ...
  model: z.string(),
  conversation_id: z.string().optional(),
  parent_message_id: z.string().optional(),
  messages: z
    .array(
      z.object({
        id: z.string().optional(),
        author: z.any().optional(),
        content: z.object({
          content_type: z.string(),
          parts: z.array(z.union([z.string(), z.any()])),
        }),
        metadata: z.any().optional(),
      }),
    )
    .optional(),
});

function getTextFromCompletionRequest(data: z.infer<typeof ChatgptCompletionRequestSchema>) {
  if (!data.messages || data.action === "continue") {
    return "";
  }
  const message = data.messages[0];
  if (!message?.content?.parts) {
    return "";
  }
  let text = "";
  for (const part of message.content.parts) {
    if (typeof part === "string") {
      text += part;
    }
  }
  return text;
}

export async function POST(request: NextRequest, { params }: { params: { instanceId: string } }) {
  const urlParams = request.nextUrl.searchParams;
  const userToken = request.headers.get("authorization")?.replace("Bearer ", "");
  const gfsessionid = request.cookies.get("gfsessionid");
  const referer = request.headers.get("referer");
  const requestIp = request.ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for");
  const { instanceId } = params;
  const teamId = request.headers.get("Chatgpt-Account-Id") ?? request.cookies.get("_account")?.value;

  console.debug("teamId:", teamId);

  if (!userToken || !instanceId) {
    return NextResponse.json({ detail: "invalid audit request" }, { status: 400 });
  }

  try {
    const userInstanceAbility = await db.query.userInstanceAbilities.findFirst({
      where: and(eq(userInstanceAbilities.token, userToken), eq(userInstanceAbilities.instanceId, instanceId)),
    });
    if (!userInstanceAbility) {
      return NextResponse.json({ detail: "invalid token" }, { status: 401 });
    }
    if (!userInstanceAbility.canUse) {
      return NextResponse.json({ detail: "You are not permitted to use this instance." }, { status: 401 });
    }

    const content = await request.json();
    const data = ChatgptCompletionRequestSchema.parse(content);
    const text = getTextFromCompletionRequest(data);

    const result = await writeChatResourceUsageLog(db, {
      userId: userInstanceAbility.userId,
      instanceId,
      text,
      type: ServiceTypeSchema.Values.CHATGPT_SHARED,
      textBytes: Buffer.byteLength(text, "utf-8"),
      details: {
        type: ServiceTypeSchema.Values.CHATGPT_SHARED,
        model: data.model,
        chatgptAccountId: teamId,
        inputTokens: undefined,
        conversationId: data.conversation_id,
      },
    });

    console.debug("UserResourceUsageLog created", result);
    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error(e);
    if (e instanceof SyntaxError) {
      return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
    } else {
      return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
  }
}
