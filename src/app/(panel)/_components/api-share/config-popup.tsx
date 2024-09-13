"use client";

import * as React from "react";
import * as z from "zod";

import { popup } from "@/components/popup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { APIShareInstanceDataSchema } from "@/schema/service/api-share.schema";
import { InputTags } from "@/components/custom/input-tags";

const ServiceInstanceSchema = z.object({
  id: z.string(),
  data: APIShareInstanceDataSchema.optional(),
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

export function popupAPIShareConfigForm(instanceDetails: ServiceInstanceDetails) {
  const closePopup = popup({
    title: "Instance Configuration",
    description: "View details of the service instance",
    content: () => <APIShareConfigPopup instanceDetails={instanceDetails} closePopup={closePopup} />,
  });

  return closePopup;
}

interface InstanceConfigDetailsProps {
  className?: string;
  instanceDetails: ServiceInstanceDetails;
  closePopup: () => void;
}

function APIShareConfigPopup({ className, instanceDetails, closePopup }: InstanceConfigDetailsProps) {
  const { id, data } = instanceDetails;
  const [loading, setLoading] = React.useState(false);
  const updateDataMutation = api.serviceInstance.updateData.useMutation();

  const form = useForm<z.infer<typeof APIShareInstanceDataSchema>>({
    defaultValues: data ?? {
      type: "API_SHARE",
      api_type: "OPENAI",
      upstream_url: "",
      token: "",
      models: [],
      model_tags: [],
      default_tag_whitelist: [],
      record_prompts: true,
      record_completions: true,
    },
    resolver: zodResolver(APIShareInstanceDataSchema),
  });

  const onSubmit = async (values: z.infer<typeof APIShareInstanceDataSchema>) => {
    try {
      setLoading(true);
      await updateDataMutation.mutateAsync({
        id,
        data: values,
      });
      toast.success("Instance configuration updated");
      closePopup();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update instance configuration: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form key={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="upstream_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Upstream URL</FormLabel>
              <div className="flex flex-row">
                <FormControl>
                  <Input placeholder="https://api.example.com/v1" {...field} />
                </FormControl>
                {/* <FunctionButton onClick={testAuthKey}>Test</FunctionButton> */}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>API Token</FormLabel>
              <div className="flex flex-row">
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                {/* <FunctionButton onClick={testAuthKey}>Test</FunctionButton> */}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model_tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Model Tags</FormLabel>
              <FormControl>
                <InputTags {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default_tag_whitelist"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Default Tag Whitelist</FormLabel>
              <FormControl>
                <InputTags {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="record_prompts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between ">
              <div className="space-y-0.5">
                <FormLabel>Record Prompts</FormLabel>
                <FormDescription>在日志中记录请求的消息内容</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="record_completions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel>Record Completions</FormLabel>
                <FormDescription>在日志中记录响应的消息内容</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
