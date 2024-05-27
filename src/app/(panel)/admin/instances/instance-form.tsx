import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceInstanceCreateSchema } from "@/schema/serviceInstance.schema";
import { ServiceTypeSchema } from "@/server/db/enum";
import { LoadingButton } from "@/components/loading-button";

export const InstanceFormSchema = ServiceInstanceCreateSchema.merge(
  z.object({
    url: z
      .string()
      .url()
      .optional()
      .refine(
        (url) => {
          if (!url) return true;
          return !url.endsWith("/");
        },
        { message: "URL should not end with a slash" },
      ),
    description: z.string().optional(),
    grantToAllActiveUsers: z.boolean(),
  }),
).refine((data) => data.type !== "CHATGPT_SHARED" || data.url, {
  path: ["url"],
  message: "URL is required when type is CHATGPT_SHARED",
});

type InstanceFormProps = {
  onSubmit: (values: z.infer<typeof InstanceFormSchema>) => Promise<void>;
  defaultValues?: Partial<z.infer<typeof InstanceFormSchema>>;
  loading?: boolean;
};

export function InstanceForm({ onSubmit, defaultValues, loading }: InstanceFormProps) {
  const form = useForm<z.infer<typeof InstanceFormSchema>>({
    defaultValues: {
      type: "CHATGPT_SHARED",
      grantToAllActiveUsers: false,
      ...defaultValues,
    },
    resolver: zodResolver(InstanceFormSchema),
  });

  return (
    <Form {...form}>
      <form key={defaultValues?.name} onSubmit={form.handleSubmit(onSubmit)} className="max-w-[600px] space-y-8">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Type</FormLabel>
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
              <FormDescription>“CHATGPT_SHARED” for CockroackAI.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormDescription>Public displayed name for the instance.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("type") !== "POEKMON_API" && (
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Url</FormLabel>
                <FormControl>
                  <Input placeholder="https://" {...field} />
                </FormControl>
                <FormDescription>Base URL of the service.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
