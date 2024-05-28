import { writeChatResourceUsageLog } from "@/server/actions/write-resource-usage-log";
import { db } from "@/server/db";
import { serviceInstances, userInstanceAbilities } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { ServiceTypeSchema } from "@/server/db/enum";
import { TRPCError } from "@trpc/server";
import {
  OpenAIChatCompletionRequestSchema,
  OpenAIChatCompletionResponseSchema,
  type OpenAIChatCompletionResponseUsage,
  OpenAIChatCompletionStreamResponseSchema,
  type OpenAIResponseMessage,
} from "@/schema/external/openai.schema";
import { PoekmonAPIInstanceData, type PoekmonAPIResourceUsageLogDetails } from "@/schema/service/poekmon-api.schema";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const { slug } = params;
  const p = slug.join("/");
  if (p !== "v1/chat/completions") {
    return NextResponse.json({ detail: "Not Found" }, { status: 404 });
  }

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });

  return new NextResponse(null, {
    status: 204,
    headers: headers,
  });
}

export async function POST(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const userToken = request.headers.get("authorization")?.replace("Bearer ", "");
  const { instanceId, slug } = params;
  const p = slug.join("/");
  if (p !== "v1/chat/completions") {
    return NextResponse.json({ detail: "Not Found" }, { status: 404 });
  }

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

    const instance = await db.query.serviceInstances.findFirst({
      where: eq(serviceInstances.id, instanceId),
    });
    if (!instance) {
      return NextResponse.json({ detail: "Instance not found" }, { status: 404 });
    }
    if (instance.type !== ServiceTypeSchema.Values.POEKMON_API) {
      return NextResponse.json({ detail: "Invalid instance type" }, { status: 400 });
    }
    if (!instance.data) {
      return NextResponse.json({ detail: "Instance not configuered" }, { status: 404 });
    }

    const instanceData = instance.data as PoekmonAPIInstanceData;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestBody = await request.json();
    const openaiRequest = OpenAIChatCompletionRequestSchema.parse(requestBody);

    const url = instanceData.url;
    const proxyUrl = `${url}/v1/chat/completions`;
    const proxyResponse = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instanceData.auth_key}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!proxyResponse.ok) {
      const text = await proxyResponse.text();
      console.warn("Poekmon API proxy response not ok", proxyResponse.status, text);
      return new NextResponse(text, {
        status: proxyResponse.status,
        headers: proxyResponse.headers,
      });
    }

    const contentType = proxyResponse.headers.get("content-type");

    const resourceLogDetail = {
      type: ServiceTypeSchema.Values.POEKMON_API,
      model: openaiRequest.model,
      prompt_messages: openaiRequest.messages,
      completion_messages: [],
      is_stream: false,
      finish_reason: undefined,
      usage: undefined,
    } as PoekmonAPIResourceUsageLogDetails;

    let response: NextResponse | null = null;

    if (contentType?.includes("text/event-stream")) {
      resourceLogDetail.is_stream = true;
      // Event stream response
      const reader = proxyResponse.body!.getReader();

      const newStream = new ReadableStream({
        async start(controller) {
          const completionMessage: OpenAIResponseMessage = {
            role: "assistant",
            content: "",
          };
          let usage: OpenAIChatCompletionResponseUsage | undefined = undefined;
          let finish_reason: string | undefined = undefined;
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (usage) {
                resourceLogDetail.usage = usage;
              }
              if (completionMessage) {
                resourceLogDetail.completion_messages = [completionMessage];
              }
              if (finish_reason) {
                resourceLogDetail.finish_reason = finish_reason;
              }
              controller.close();
              const log = await writeChatResourceUsageLog(db, {
                userId: userInstanceAbility.userId,
                instanceId,
                text: undefined,
                type: ServiceTypeSchema.Values.POEKMON_API,
                textBytes: undefined,
                details: resourceLogDetail,
              });
              break;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const text = decoder.decode(value);
            const lines = text.split("\n");
            for (let line of lines) {
              if (line === "") {
                continue;
              }
              if (line.startsWith("data: ")) {
                line = line.slice(6);
              }
              if (line.trim() === "" || line.trim() === "[DONE]") {
                continue;
              }
              try {
                const res = OpenAIChatCompletionStreamResponseSchema.parse(JSON.parse(line));
                if (res.choices[0]) {
                  if (res.choices[0].delta.role) {
                    completionMessage.role = res.choices[0].delta.role;
                  }
                  if (res.choices[0].delta.content) {
                    completionMessage.content += res.choices[0].delta.content;
                  }
                  if (res.choices[0].finish_reason) {
                    finish_reason = res.choices[0].finish_reason;
                  }
                }
                if (res.usage) {
                  usage = res.usage;
                }
              } catch (e) {
                console.error(e);
                continue;
              }
            }
            controller.enqueue(value);
          }
        },
      });

      response = new NextResponse(newStream, {
        status: proxyResponse.status,
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await proxyResponse.json();
      const openaiResponse = OpenAIChatCompletionResponseSchema.parse(result);

      if (openaiResponse.choices[0]) {
        resourceLogDetail.completion_messages = [openaiResponse.choices[0].message];
        resourceLogDetail.finish_reason = openaiResponse.choices[0].finish_reason ?? undefined;
        resourceLogDetail.usage = openaiResponse.usage;
      }

      response = new NextResponse(JSON.stringify(result), {
        status: proxyResponse.status,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const log = await writeChatResourceUsageLog(db, {
        userId: userInstanceAbility.userId,
        instanceId,
        text: undefined,
        type: ServiceTypeSchema.Values.POEKMON_API,
        textBytes: undefined,
        details: resourceLogDetail,
      });
    }

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // console.log("Poekmon API response", response.headers);

    return response;
  } catch (e) {
    console.error(e);
    if (e instanceof SyntaxError) {
      return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
    } else if (e instanceof TRPCError) {
      return NextResponse.json({ detail: e.message }, { status: 401 });
    } else {
      return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
    }
  }
}
