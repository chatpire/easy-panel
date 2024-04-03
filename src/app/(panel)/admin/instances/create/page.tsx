"use client";

import { useForm } from "react-hook-form";
import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceTypeSchema } from "@/schema/definition.schema";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { LoadingButton } from "@/components/loading-button";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceInstanceOptionalDefaultsSchema } from "@/schema/generated/zod";

const CreateInstanceFormSchema = ServiceInstanceOptionalDefaultsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).merge(
  z.object({
    url: z.string().url(),
    description: z.string().optional(),
    grantToAllActiveUsers: z.boolean(),
  }),
);

type CreateInstanceForm = z.infer<typeof CreateInstanceFormSchema>;

export function InstanceForm() {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CreateInstanceForm>({
    defaultValues: {
      type: "CHATGPT_SHARED",
    },
    resolver: zodResolver(CreateInstanceFormSchema),
  });

  const createMutation = api.serviceInstance.create.useMutation();
  const grantMutation = api.serviceInstance.grantToAllActiveUsers.useMutation();
  const usersQuery = api.user.getAll.useQuery();

  async function onSubmit(values: CreateInstanceForm) {
    const { grantToAllActiveUsers, ...instanceCreate } = values;

    const grantToUserIds = [];
    if (grantToAllActiveUsers) {
      grantToUserIds.push(...(usersQuery.data?.map((user) => user.id) ?? []));
    }
    console.log({ instanceCreate, grantToUserIds });

    try {
      form.clearErrors();
      setLoading(true);
      const instance = await createMutation.mutateAsync(instanceCreate);
      console.debug({ instance });
      toast.success("Instance created");
      if (grantToAllActiveUsers) {
        await grantMutation.mutateAsync({ instanceId: instance.id });
        toast.success("Instance granted to all active users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create instance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a instance type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ServiceTypeSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Note: “CHATGPT_SHARED” is for cockroackai.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>Public displayed name for the instance.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Url</FormLabel>
              <FormControl>
                <Input placeholder="https://" {...field} />
              </FormControl>
              <FormDescription>Base URL of the service.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grantToAllActiveUsers"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Publish</FormLabel>
                <FormDescription>是否使得此实例立即对所有用户可用。这将会为每个用户创建相应的 token。</FormDescription>
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

export default function CreateInstancePage({}) {
  return (
    <PageShell>
      <PageHeader heading="Create Instance" text="创建实例" />
      <div className="max-w-full overflow-hidden">
        <Card>
          <CardHeader>Create Instance</CardHeader>
          <CardContent>
            <InstanceForm />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
