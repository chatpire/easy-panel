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
import {
  type APIShareInstanceData,
  type APIShareResourceUsageLogDetails,
  type APIShareUserInstanceData,
} from "@/schema/service/api-share.schema";
import { calculateCost, filterUserAvailableModels, verifyUserAvailableModel } from "@/server/api/helpers/api-share";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const { slug } = params;
  const p = slug.join("/");

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  });

  return new NextResponse(null, {
    status: 204,
    headers: headers,
  });
}

async function completion(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
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
    if (!userInstanceAbility || userInstanceAbility.data?.type !== "API_SHARE") {
      return NextResponse.json({ detail: "invalid token" }, { status: 401 });
    }
    if (!userInstanceAbility.canUse) {
      return NextResponse.json({ detail: "You are not permitted to use this instance." }, { status: 401 });
    }

    const userInstanceData = userInstanceAbility.data;

    const instance = await db.query.serviceInstances.findFirst({
      where: eq(serviceInstances.id, instanceId),
    });
    if (!instance) {
      return NextResponse.json({ detail: "Instance not found" }, { status: 404 });
    }
    if (instance.type !== ServiceTypeSchema.Values.API_SHARE) {
      return NextResponse.json({ detail: "Invalid instance type" }, { status: 400 });
    }
    if (!instance.data) {
      return NextResponse.json({ detail: "Instance not configuered" }, { status: 404 });
    }

    const instanceData = instance.data as APIShareInstanceData;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestBody = await request.json();
    const openaiRequest = OpenAIChatCompletionRequestSchema.parse(requestBody);

    const modelConfig = verifyUserAvailableModel(openaiRequest.model, instanceData, userInstanceData);
    if (!modelConfig) {
      return NextResponse.json(
        {
          detail: `You are not permitted to use this model: ${openaiRequest.model} because it is not available.`,
        },
        { status: 401 },
      );
    }

    if (modelConfig.upstream_model?.trim() !== "") {
      openaiRequest.model = modelConfig.upstream_model ?? modelConfig.code;
    } else {
      openaiRequest.model = modelConfig.code;
    }

    // console.log("openaiRequest", openaiRequest);

    const start = Date.now();

    const url = instanceData.upstream_url;
    const proxyUrl = `${url}/chat/completions`;
    const proxyResponse = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${instanceData.token}`,
      },
      body: JSON.stringify(openaiRequest),
    });


    if (!proxyResponse.ok) {
      const text = await proxyResponse.text();
      console.warn("API Share proxy response not ok", proxyResponse.status, text);
      return new NextResponse(text, {
        status: proxyResponse.status,
        headers: proxyResponse.headers,
      });
    }

    const contentType = proxyResponse.headers.get("content-type");

    const resourceLogDetail = {
      type: ServiceTypeSchema.Values.API_SHARE,
      model: modelConfig.code,
      prompt_messages: openaiRequest.messages,
      completion_messages: [],
      is_stream: false,
      finish_reason: undefined,
      usage: undefined,
    } as APIShareResourceUsageLogDetails;

    let response: NextResponse | null = null;

    if (contentType?.includes("text/event-stream")) {
      resourceLogDetail.is_stream = true;
      if (proxyResponse.body === null) {
        console.error("Proxy response body is null");
        return NextResponse.json({ detail: "empty response body" }, { status: 500 });
      }
      // Event stream response
      const reader = proxyResponse.body.getReader();

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
                resourceLogDetail.cost = calculateCost(usage, modelConfig);
              }
              if (completionMessage) {
                resourceLogDetail.completion_messages = [completionMessage];
              }
              if (finish_reason) {
                resourceLogDetail.finish_reason = finish_reason;
              }
              controller.close();
              const timeElapsed = (Date.now() - start) / 1000;
              resourceLogDetail.time_elapsed = timeElapsed;
              await writeChatResourceUsageLog(db, {
                userId: userInstanceAbility.userId,
                instanceId,
                text: undefined,
                type: ServiceTypeSchema.Values.API_SHARE,
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
      const timeElapsed = (Date.now() - start) / 1000;
      resourceLogDetail.time_elapsed = timeElapsed;

      if (openaiResponse.choices[0]) {
        resourceLogDetail.completion_messages = [openaiResponse.choices[0].message];
        resourceLogDetail.finish_reason = openaiResponse.choices[0].finish_reason ?? undefined;
        resourceLogDetail.usage = openaiResponse.usage;

        resourceLogDetail.cost = calculateCost(openaiResponse.usage, modelConfig);
      }

      response = new NextResponse(JSON.stringify(result), {
        status: proxyResponse.status,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(
        "API Share chat completion | username=",
        userInstanceAbility.userId,
        "| model:",
        openaiRequest.model,
        "| instanceId:",
        instanceId,
        "| time_elapsed:",
        timeElapsed,
      );
      await writeChatResourceUsageLog(db, {
        userId: userInstanceAbility.userId,
        instanceId,
        text: undefined,
        type: ServiceTypeSchema.Values.API_SHARE,
        textBytes: undefined,
        details: resourceLogDetail,
      });
    }

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

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

async function listModels(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const userToken = request.headers.get("authorization")?.replace("Bearer ", "");
  const { instanceId, slug } = params;
  const p = slug.join("/");
  if (p !== "v1/models") {
    return NextResponse.json({ detail: "Not Found" }, { status: 404 });
  }

  if (!userToken || !instanceId) {
    return NextResponse.json({ detail: "invalid audit request" }, { status: 400 });
  }

  try {
    const userInstanceAbility = await db.query.userInstanceAbilities.findFirst({
      where: and(eq(userInstanceAbilities.token, userToken), eq(userInstanceAbilities.instanceId, instanceId)),
    });
    if (!userInstanceAbility || userInstanceAbility.data?.type !== "API_SHARE") {
      return NextResponse.json({ detail: "invalid token" }, { status: 401 });
    }
    if (!userInstanceAbility.canUse) {
      return NextResponse.json({ detail: "You are not permitted to use this instance." }, { status: 401 });
    }

    const userInstanceData = userInstanceAbility.data;

    const instance = await db.query.serviceInstances.findFirst({
      where: eq(serviceInstances.id, instanceId),
    });
    if (!instance) {
      return NextResponse.json({ detail: "Instance not found" }, { status: 404 });
    }
    if (instance.type !== ServiceTypeSchema.Values.API_SHARE) {
      return NextResponse.json({ detail: "Invalid instance type" }, { status: 400 });
    }
    if (!instance.data) {
      return NextResponse.json({ detail: "Instance not configuered" }, { status: 404 });
    }

    const instanceData = instance.data as APIShareInstanceData;

    const models = filterUserAvailableModels(instanceData, userInstanceData);

    const result = {
      object: "list",
      data: models.map((model) => {
        return {
          id: model.code,
          object: "model",
          owned_by: "openai",
          created: 1626777600,
        };
      }),
    };
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const { slug } = params;
  const p = slug.join("/");
  if (p === "v1/chat/completions") {
    return completion(request, { params });
  }
  return NextResponse.json({ detail: "Not Found" }, { status: 404 });
}

export async function GET(request: NextRequest, { params }: { params: { instanceId: string; slug: string[] } }) {
  const { slug } = params;
  const p = slug.join("/");
  if (p === "v1/models") {
    return listModels(request, { params });
  }
  return NextResponse.json({ detail: "Not Found" }, { status: 404 });
}
