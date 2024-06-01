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
  instanceIdCanUse: z.record(z.boolean()),
});

type InstancesSelection = z.infer<typeof InstancesSelectionSchema>;

export function popupGenerateTokensForm(userId: string, username: string) {
  const closePopup = popup({
    title: "Edit Instance Permissions",
    description: `Edit instance permissions for @${username}`,
    content: (clossFn) => <UserInstanceAbilityForm userId={userId} closePopup={clossFn} />,
  });

  return closePopup;
}

interface Props extends React.ComponentProps<"form"> {
  className?: string;
  userId: string;
  closePopup: () => void;
}

function UserInstanceAbilityForm({ className, userId, closePopup }: Props) {
  const instancesQuery = api.serviceInstance.getAllAdmin.useQuery();
  const userInstanceAbilitiesQuery = api.userInstanceAbility.getMany.useQuery({ userId });
  const mutation = api.userInstanceAbility.grantInstancesToUser.useMutation();

  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const form = useForm<InstancesSelection>({
    resolver: zodResolver(InstancesSelectionSchema),
    defaultValues: {
      instanceIdCanUse: {},
    },
  });

  React.useEffect(() => {
    if (instancesQuery.data) {
      form.setValue(
        "instanceIdCanUse",
        instancesQuery.data.reduce(
          (acc, { id }) => {
            acc[id] = false;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      );
    }
    if (userInstanceAbilitiesQuery.data) {
      form.setValue(
        "instanceIdCanUse",
        userInstanceAbilitiesQuery.data.reduce(
          (acc, { instanceId, canUse }) => {
            acc[instanceId] = canUse;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      );
    }
  }, [userInstanceAbilitiesQuery.data, instancesQuery.data, form]);

  async function onSubmit(values: InstancesSelection) {
    const { instanceIdCanUse } = values;
    console.log("values", values);
    try {
      form.clearErrors();
      setIsSaving(true);
      const instanceIds = Object.entries(instanceIdCanUse).reduce((acc, [instanceId, canUse]) => {
        if (canUse) {
          acc.push(instanceId);
        }
        return acc;
      }, [] as string[]);
      await mutation.mutateAsync({ userId, instanceIds });
      form.reset();
      toast.success("Edit abilities successfully");
      closePopup();
    } catch (error) {
      console.error(error);
      form.setError("instanceIdCanUse", { message: String(error) });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid items-start gap-4", className)}>
        <FormField
          control={form.control}
          name="instanceIdCanUse"
          render={({ field }) => {
            const { value, onChange } = field;
            return (
              <FormItem>
                <FormControl>
                  <div className="w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-full">
                        <div className="w-full rounded-md border p-2 text-sm">
                          {instancesQuery.data?.length ?? "null"} Instances,{" "}
                          {Object.values(value).filter(Boolean).length} can use
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {instancesQuery.data?.map((instance) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={instance.id}
                              checked={value[instance.id]}
                              onCheckedChange={(val) =>
                                val
                                  ? onChange({ ...value, [instance.id]: true })
                                  : onChange({ ...value, [instance.id]: false })
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
