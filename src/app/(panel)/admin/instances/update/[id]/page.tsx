"use client";

import { PageShell } from "../../../../_components/dashboard-shell";
import { PageHeader } from "../../../../_components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { InstanceForm, type InstanceFormSchema } from "../../instance-form";
import { type z } from "zod";
import { useState } from "react";
import { notFound } from "next/navigation";

export default function UpdateInstancePage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const instanceId = params.id;
  const instanceQuery = api.serviceInstance.getById.useQuery({ id: instanceId }, { retry: false });
  const updateMutation = api.serviceInstance.update.useMutation();

  if (instanceQuery.isError) {
    notFound();
  }

  async function onSubmit(values: z.infer<typeof InstanceFormSchema>) {
    try {
      setLoading(true);
      await updateMutation.mutateAsync({
        ...values,
        id: instanceId,
      });
      toast.success("Instance updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update instance: " + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader heading={"Update Instance"} text="更新实例" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Update Instance {instanceQuery.data?.name}</CardHeader>
          {instanceQuery.data ? (
          <CardContent>
            <InstanceForm
              onSubmit={onSubmit}
              defaultValues={{
                ...instanceQuery.data,
                url: instanceQuery.data?.url ?? undefined,
                description: instanceQuery.data?.description ?? undefined,
              }}
              loading={loading}
            />
          </CardContent>
          ) : (
            <CardContent>Loading...</CardContent>
          
          )}
        </Card>
      </div>
    </PageShell>
  );
}
