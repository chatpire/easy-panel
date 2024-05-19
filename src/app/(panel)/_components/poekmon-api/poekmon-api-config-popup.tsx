"use client";

import * as React from "react";
import * as z from "zod";

import { popup } from "@/components/popup";
import { useForm } from "react-hook-form";
import { PoekmonAPIInstanceDataSchema } from "@/schema/service/poekmon-api.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FunctionButton, LoadingButton } from "@/components/loading-button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/trpc/react";

const ServiceInstanceSchema = z.object({
  id: z.string(),
  data: PoekmonAPIInstanceDataSchema.optional(),
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

export function popupPoekmonAPIConfigForm(instanceDetails: ServiceInstanceDetails) {
  const closePopup = popup({
    title: "Instance Configuration",
    description: "View details of the service instance",
    content: () => <PoekmonAPIConfigPopup instanceDetails={instanceDetails} closePopup={closePopup} />,
  });

  return closePopup;
}

interface InstanceConfigDetailsProps {
  className?: string;
  instanceDetails: ServiceInstanceDetails;
  closePopup: () => void;
}

function PoekmonAPIConfigPopup({ className, instanceDetails, closePopup }: InstanceConfigDetailsProps) {
  const { id, data } = instanceDetails;
  const [loading, setLoading] = React.useState(false);
  const updateDataMutation = api.serviceInstance.updateData.useMutation();

  const form = useForm<z.infer<typeof PoekmonAPIInstanceDataSchema>>({
    defaultValues: data ?? {
      type: "POEKMON_API",
      auth_key: "",
      record_prompts: true,
      record_completions: true,
    },
    resolver: zodResolver(PoekmonAPIInstanceDataSchema),
  });

  // const testAuthKey = async () => {
  //   try {
  //     const response = await fetch(`${url}/status`, {
  //       headers: {
  //         Authorization: `Bearer ${form.getValues().auth_key}`,
  //       },
  //     });
  //     if (response.ok) {
  //       toast.success("Auth key is valid");
  //     } else {
  //       toast.error("Test connection failed");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Test connection failed: " + String(error));
  //   }
  // };

  const onSubmit = async (values: z.infer<typeof PoekmonAPIInstanceDataSchema>) => {
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
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>URL</FormLabel>
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
          name="auth_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Auth Key</FormLabel>
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
