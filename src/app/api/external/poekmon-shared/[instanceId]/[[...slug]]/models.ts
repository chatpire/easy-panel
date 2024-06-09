import {
  PoeAccountCookieSchema,
  PoekmonSharedAccountDataSchema,
  PoekmonSharedResourceUsageLogDetailsSchema,
  PoekmonSharedUserInstanceDataSchema,
} from "@/schema/service/poekmon-shared.schema";
import { z } from "@hono/zod-openapi";

// PoekmonSharedUserInstanceDataSchema
export const UserDataModel = PoekmonSharedUserInstanceDataSchema.omit({ type: true }).openapi("UserDataModel");
export type UserData = z.infer<typeof UserDataModel>;

export const PoeAccountModel = PoekmonSharedAccountDataSchema.openapi("PoeAccountModel");

export const PoeAccountCookiesModel = z.array(PoeAccountCookieSchema).openapi("PoeAccountCookiesModel");

export const ChatLogContentModel = PoekmonSharedResourceUsageLogDetailsSchema.omit({
  type: true,
})
  .merge(
    z.object({
      user_id: z.string(),
    }),
  )
  .openapi("ChatLogContentModel");

export type ChatLogContent = z.infer<typeof ChatLogContentModel>;
