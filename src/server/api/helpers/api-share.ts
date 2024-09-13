import { OpenAIChatCompletionResponseUsage } from "@/schema/external/openai.schema";
import { APIShareInstanceData, APIShareModel, APIShareUserInstanceData } from "@/schema/service/api-share.schema";

function createModelMap(models: APIShareModel[]): Record<string, APIShareModel> {
  return models.reduce(
    (acc, model) => {
      acc[model.code] = model;
      if (model.code_alias) {
        for (const alias of model.code_alias) {
          acc[alias] = model;
        }
      }
      return acc;
    },
    {} as Record<string, APIShareModel>,
  );
}

export function filterUserAvailableModels(
  instanceData: APIShareInstanceData,
  userInstanceData: APIShareUserInstanceData,
): APIShareModel[] {
  console.log(instanceData.default_tag_whitelist, userInstanceData.tag_whitelist);
  const model_map = createModelMap(instanceData.models);
  let tagWhitelist = userInstanceData.tag_whitelist;
  if (!tagWhitelist || tagWhitelist.length === 0) {
    tagWhitelist = instanceData.default_tag_whitelist;
  }
  const models = Object.values(model_map).filter((model) => {
    if (model.tags && model.tags.length > 0) {
      return model.tags.some((tag) => tagWhitelist.includes(tag));
    }
    return true;
  });
  const uniqueModels = models.filter((model, index, self) => index === self.findIndex((t) => t.code === model.code));
  return uniqueModels;
}

export function verifyUserAvailableModel(
  modelName: string,
  instanceData: APIShareInstanceData,
  userInstanceData: APIShareUserInstanceData,
): APIShareModel | null {
  const model_map = createModelMap(instanceData.models);
  const model = model_map[modelName];
  if (!model) {
    return null;
  }
  if (model.tags && model.tags.length > 0) {
    let tagWhitelist = userInstanceData.tag_whitelist;
    if (!tagWhitelist || tagWhitelist.length === 0) {
      tagWhitelist = instanceData.default_tag_whitelist;
    }
    if (!model.tags.some((tag) => tagWhitelist.includes(tag))) {
      return null;
    }
  }
  return model;
}

export function calculateCost(usage: OpenAIChatCompletionResponseUsage | undefined, model: APIShareModel) {
  if (!usage) {
    return undefined;
  }
  const cost =
    (usage.completion_tokens * model.completion_price) / 1000000 + (usage.prompt_tokens * model.prompt_price) / 1000000;
  return cost;
}
