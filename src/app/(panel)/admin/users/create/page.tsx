"use client";

import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { type CreateUserForm, UserForm } from "../UserForm";

export default function CreateUserPage({}) {
  const [loading, setLoading] = React.useState(false);
  const createMutation = api.user.create.useMutation();
  const instancesQuery = api.serviceInstance.getAllWithToken.useQuery();

  async function onSubmit(values: CreateUserForm) {
    const { generateTokens, clearPassword, ...userCreate } = values;
    if (clearPassword) {
      throw new Error("Clear password is not supported in create");
    }

    const instanceIds = generateTokens ? instancesQuery.data?.map((instance) => instance.id) ?? [] : [];
    console.log({ userCreate, instanceIds });

    try {
      setLoading(true);
      await createMutation.mutateAsync({ user: userCreate, instanceIds });
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
      <PageHeader heading="Create User" text="创建用户" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Create User</CardHeader>
          <CardContent>
            <UserForm
              onSubmit={onSubmit}
              loading={loading}
              passwordMode="input"
              defaultValues={{
                generateTokens: true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
