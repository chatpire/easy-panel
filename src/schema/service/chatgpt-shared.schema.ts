import { z } from "zod";

export const ChatGPTSharedInstanceAttributesSchema = z.object({
    type: z.literal("CHATGPT_SHARED"),
    url: z.string().url(),
    serverIp: z.string().ip(),
  });