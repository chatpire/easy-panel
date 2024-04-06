"use client";

import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { InstanceForm, type InstanceFormSchema } from "../instance-form";
import { type z } from "zod";
import { popupChatGPTShareInstanceConfigDetails } from "../chatgpt-share-config-popup";
import { useState } from "react";

export default function CreateInstancePage({}) {
  const [loading, setLoading] = useState(false);
  const createMutation = api.serviceInstance.create.useMutation();
  const grantMutation = api.serviceInstance.grantToAllActiveUsers.useMutation();
  const usersQuery = api.user.getAll.useQuery();

  async function onSubmit(values: z.infer<typeof InstanceFormSchema>) {
    const { grantToAllActiveUsers, ...instanceCreate } = values;

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
      popupChatGPTShareInstanceConfigDetails({ url: instance.url ?? "", id: instance.id });
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
            <InstanceForm onSubmit={onSubmit} loading={loading} defaultValues={{
              grantToAllActiveUsers: true,
            }}/>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
