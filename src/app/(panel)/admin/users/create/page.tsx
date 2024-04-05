"use client";

import { useForm } from "react-hook-form";
import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { LoadingButton } from "@/components/loading-button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCreateSchema } from "@/schema/user.schema";
import { Button } from "@/components/ui/button";
import { generateId } from "lucia";

const CreateUserFormSchema = UserCreateSchema.merge(
  z.object({
    email: z.string().optional(),
    comment: z.string().optional(),
    generateTokens: z.boolean(),
  }),
);

type CreateUserForm = z.infer<typeof CreateUserFormSchema>;

function UserForm() {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CreateUserForm>({
    defaultValues: {
      generateTokens: true,
    },
    resolver: zodResolver(CreateUserFormSchema),
  });

  const createMutation = api.user.create.useMutation();
  const instancesQuery = api.serviceInstance.getAll.useQuery();

  async function onSubmit(values: CreateUserForm) {
    const { generateTokens, ...userCreate } = values;

    const instanceIds = generateTokens ? instancesQuery.data?.map((instance) => instance.id) ?? [] : [];
    console.log({ userCreate, instanceIds });

    try {
      form.clearErrors();
      setLoading(true);
      await createMutation.mutateAsync({ user: userCreate, instanceIds });
      toast.success("User created");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user: " + String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[600px] space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Username</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>Used to identify OIDC user</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="flex flex-row space-x-4">
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <Button variant="secondary" type="button" onClick={() => form.setValue("password", generateId(16))}>
                  Generate
                </Button>
              </div>
              <FormDescription>Leave blank to only allow OIDC login</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>Comments are unvisible to user</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="generateTokens"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Generate Tokens</FormLabel>
                <FormDescription>是否为此用户生成所有实例的 tokens（允许使用全部实例）</FormDescription>
              </div>
            </FormItem>
          )}
        />
        <LoadingButton loading={loading} type="submit">
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}

export default function CreateUserPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Create User" text="创建用户" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Create User</CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
