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
