"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { popup } from "@/components/popup";
import { api } from "@/trpc/react";
import { Icons } from "@/components/icons";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const InstancesSelectionSchema = z.object({
  instanceIds: z.array(z.string()),
});

type InstancesSelection = z.infer<typeof InstancesSelectionSchema>;

export function popupGenerateTokensForm(userId: string, username: string) {
  const closePopup = popup({
    title: "Generate Instance Tokens",
    description: `Generate instance tokens for @${username}`,
    content: (clossFn) => <GenerateInstanceTokensForm userId={userId} closePopup={clossFn} />,
  });

  return closePopup;
}

interface EditPasswordFormProps extends React.ComponentProps<"form"> {
  className?: string;
  userId: string;
  closePopup: () => void;
}

function GenerateInstanceTokensForm({ className, userId, closePopup }: EditPasswordFormProps) {
  const mutation = api.user.generateTokens.useMutation();
  const instancesQuery = api.serviceInstance.getAll.useQuery();

  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const form = useForm<InstancesSelection>({
    resolver: zodResolver(InstancesSelectionSchema),
    defaultValues: {
      instanceIds: instancesQuery.data?.map((instance) => instance.id) ?? [],
    },
  });

  async function onSubmit(values: InstancesSelection) {
    try {
      form.clearErrors();
      setIsSaving(true);
      await mutation.mutateAsync({ userId, instanceIds: values.instanceIds });
      form.reset();
      toast.success("Tokens generated successfully");
      closePopup();
    } catch (error) {
      console.error(error);
      form.setError("instanceIds", { message: String(error) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid items-start gap-4", className)}>
        <FormField
          control={form.control}
          name="instanceIds"
          render={({ field }) => {
            const { value, onChange } = field;
            return (
              <FormItem>
                <FormControl>
                  <div className="w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <div className="w-full rounded-md border p-2 text-sm">
                          {value.length} instance{value.length > 1 ? "s" : ""} selected
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {instancesQuery.data?.map((instance) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={instance.id}
                              checked={value.includes(instance.id)}
                              onCheckedChange={(val) =>
                                val
                                  ? onChange([...value, instance.id])
                                  : onChange(value.filter((id) => id !== instance.id))
                              }
                            >
                              {instance.name}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button type="submit" className="mt-2" disabled={isSaving}>
          {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
