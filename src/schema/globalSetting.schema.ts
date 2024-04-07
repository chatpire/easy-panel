import { globalSettings } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const GlobalSettingKeySchema = z.enum(["chatGPTShareAnnouncement"]);
export type GlobalSettingKey = z.infer<typeof GlobalSettingKeySchema>;

export const ChatGPTShareAnnouncementGlobalSettingSchema = z.object({
  key: z.literal("chatGPTShareAnnouncement"),
  text: z.string(),
});

export const GlobalSettingContentSchema = z.discriminatedUnion("key", [ChatGPTShareAnnouncementGlobalSettingSchema]);
export type GlobalSettingContent = z.infer<typeof GlobalSettingContentSchema>;

type OmitKey<T> = Omit<T, "key">;

export type GlobalSettingValue<K> = OmitKey<Extract<GlobalSettingContent, { key: K }>>;

export type SettingsDefinition = {
  [K in GlobalSettingKey]: {
    description?: string;
    defaultValue: GlobalSettingValue<K>;
  };
};

export const GlobalSettingSchema = createSelectSchema(globalSettings).merge(
  z.object({
    key: GlobalSettingKeySchema,
    content: GlobalSettingContentSchema,
  }),
);

export type GlobalSetting = z.infer<typeof GlobalSettingSchema>;
