import { PoekmonSharedAccountSchema } from "@/schema/service/poekmon-shared.schema";
import { z } from "@hono/zod-openapi";

// PoekmonSharedUserInstanceDataSchema
export const UserDataModel = z
  .object({
    chat_ids: z.array(z.string()),
    bot_ids: z.array(z.string()),
    available_points: z.number().int(),
  })
  .openapi("UserDataModel");
export type UserData = z.infer<typeof UserDataModel>;

export const PoeAccountDataModel = PoekmonSharedAccountSchema.openapi("PoeAccountDataModel");

export const ChatLogModel = z
  .object({
    user_id: z.string(),
    bot: z.string(),
    chat_id: z.string(),
    poe_account_id: z.string(),
    query: z.string(),
    attachments: z.array(z.string()),
    consume_point: z.number().int(),
    is_success: z.boolean(),
  })
  .openapi("ChatLogModel");
export type ChatLog = z.infer<typeof ChatLogModel>;
