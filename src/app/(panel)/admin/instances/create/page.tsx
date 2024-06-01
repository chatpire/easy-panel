"use client";

import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { InstanceForm, type InstanceFormSchema } from "../instance-form";
import { type z } from "zod";
import { popupChatGPTShareInstanceConfigDetails } from "../../../_components/chatgpt-shared/chatgpt-share-config-popup";
import { useState } from "react";
import { popupPoekmonAPIConfigForm } from "../../../_components/poekmon-api/poekmon-api-config-popup";
import { popupPoekmonSharedInstanceConfigDetails } from "@/app/(panel)/_components/poekmon-shared/poekmon-shared-config-popup";
import { type PoekmonSharedInstanceData, defaultPoekmonSharedAccount } from "@/schema/service/poekmon-shared.schema";
import { generateId } from "lucia";

export default function CreateInstancePage({}) {
  const [loading, setLoading] = useState(false);
  const createMutation = api.serviceInstance.create.useMutation();
  const grantMutation = api.userInstanceAbility.grantInstanceToAllActiveUsers.useMutation();
  const usersQuery = api.user.getAll.useQuery();

  async function onSubmit(values: z.infer<typeof InstanceFormSchema>) {
    const { grantToAllActiveUsers, ...instanceCreate } = values;

    if (instanceCreate.type === "CHATGPT_SHARED" && !instanceCreate.url) {
      toast.error("URL is required for ChatGPT Shared instance");
      return;
    }

    if (instanceCreate.type === "POEKMON_SHARED") {
      if (!instanceCreate.url) {
        toast.error("URL is required for Poekmon Shared instance");
        return;
      }
      instanceCreate.data = {
        type: "POEKMON_SHARED",
        secret: generateId(24),
        poe_account: defaultPoekmonSharedAccount(),
      } as PoekmonSharedInstanceData;
    }

    const grantToUserIds = [];
    if (grantToAllActiveUsers) {
      grantToUserIds.push(...(usersQuery.data?.map((user) => user.id) ?? []));
    }
    console.log({ instanceCreate, grantToUserIds });

    try {
      setLoading(true);
      const instance = await createMutation.mutateAsync(instanceCreate);
      console.debug({ instance });
      if (grantToAllActiveUsers) {
        await grantMutation.mutateAsync({ instanceId: instance.id });
        toast.success("Instance granted to all active users");
      }
      toast.success("Instance created");
      if (instance.type === "CHATGPT_SHARED") {
        if (instance.url === null) {
          throw new Error("Instance URL is missing");
        }
        popupChatGPTShareInstanceConfigDetails({
          ...instance,
          url: instance.url,
        });
      } else if (instance.type === "POEKMON_API") {
        popupPoekmonAPIConfigForm({
          ...instance,
          data: undefined,
        });
      } else if (instance.type === "POEKMON_SHARED") {
        popupPoekmonSharedInstanceConfigDetails({
          ...instance,
          data: instance.data!,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create instance: " + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader heading="Create Instance" text="创建实例" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Create Instance</CardHeader>
          <CardContent>
            <InstanceForm
              onSubmit={onSubmit}
              loading={loading}
              defaultValues={{
                grantToAllActiveUsers: true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
