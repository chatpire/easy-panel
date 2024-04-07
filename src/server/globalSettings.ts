import {
  type GlobalSetting,
  GlobalSettingSchema,
  type SettingsDefinition,
  type GlobalSettingKey,
  type GlobalSettingValue,
  GlobalSettingContentSchema,
} from "@/schema/globalSetting.schema";
import { db } from "@/server/db";
import { globalSettings } from "@/server/db/schema";
import { eq } from "drizzle-orm/expressions";

const settingsDefinition: SettingsDefinition = {
  chatGPTShareAnnouncement: {
    description: undefined,
    defaultValue: {
      text: `请根据账号使用情况选择合适的账号。`,
    },
  },
};

class GlobalSettingsManager {
  private async getSetting(key: string): Promise<GlobalSetting | undefined> {
    const result = await db.query.globalSettings.findFirst({
      where: eq(globalSettings.key, key),
    });
    return result ? GlobalSettingSchema.parse(result) : undefined;
  }

  async setSetting<K extends GlobalSettingKey>(key: K, value: GlobalSettingValue<K>) {
    const content = {
      key,
      ...value,
    };
    await db
      .insert(globalSettings)
      .values({ key, content })
      .onConflictDoUpdate({
        target: globalSettings.key,
        set: {
          content,
          updatedAt: new Date(),
        },
      });
  }

  async getSettingContent<K extends GlobalSettingKey>(key: K) {
    const item = await this.getSetting(key);
    if (item === undefined) {
      const defaultValue = settingsDefinition[key]?.defaultValue;
      await this.setSetting(key, defaultValue);
      return {
        key,
        ...defaultValue,
      };
    }
    return GlobalSettingContentSchema.parse(item.content);
  }
}

export const globalSettingsManager = new GlobalSettingsManager();
