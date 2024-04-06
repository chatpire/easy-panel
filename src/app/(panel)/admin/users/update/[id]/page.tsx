"use client";

import { PageShell } from "../../../../_components/dashboard-shell";
import { PageHeader } from "../../../../_components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { type CreateUserForm, UserForm } from "../../UserForm";
import { notFound } from "next/navigation";

export default function UpdateUserPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [loading, setLoading] = React.useState(false);
  const userQuery = api.user.getById.useQuery({ id }, { retry: false });
  const updateMutation = api.user.update.useMutation();
  const generateTokensMutation = api.user.generateTokens.useMutation();
  const instancesQuery = api.serviceInstance.getAll.useQuery();

  if (userQuery.error) {
     notFound();
  }

  async function onSubmit(values: CreateUserForm) {
    const { generateTokens, ...userUpdate } = values;
    const instanceIds = generateTokens ? instancesQuery.data?.map((instance) => instance.id) ?? [] : [];

    try {
      setLoading(true);
      await updateMutation.mutateAsync({ id, ...userUpdate });
      await generateTokensMutation.mutateAsync({ userId: id, instanceIds });
      toast.success("User created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user: " + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <PageHeader heading="Update User" text="更新用户" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Update User</CardHeader>
          <CardContent>
            <UserForm
              onSubmit={onSubmit}
              loading={loading}
              passwordMode="clear"
              defaultValues={{
                ...userQuery.data,
                email: userQuery.data?.email ?? undefined,
                comment: userQuery.data?.comment ?? undefined,
                generateTokens: false,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}