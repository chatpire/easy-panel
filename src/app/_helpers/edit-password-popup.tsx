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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const changePasswordFormSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordInput = z.infer<typeof changePasswordFormSchema>;

export function popupEditPasswordForm(userId: string, username: string) {
  const closePopup = popup({
    title: "Edit Password",
    description: `Update password for @${username}`,
    content: (clossFn) => <EditPasswordForm userId={userId} closePopup={clossFn} />,
  });

  return closePopup;
}

interface EditPasswordFormProps extends React.ComponentProps<"form"> {
  className?: string;
  userId: string;
  closePopup: () => void;
}

function EditPasswordForm({ className, userId, closePopup }: EditPasswordFormProps) {
  const changePasswordMutation = api.user.changePassword.useMutation();
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ChangePasswordInput) {
    try {
      form.clearErrors();
      setIsSaving(true);
      await changePasswordMutation.mutateAsync({ id: userId, password: values.newPassword });
      form.reset();
      toast.success("Password changed successfully");
      closePopup();
    } catch (error) {
      console.error("Failed to change password:", error);
      form.setError("confirmPassword", { message: "Failed to change password" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid items-start gap-4", className)}>
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2" disabled={isSaving}>
          {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Submit
        </Button>
      </form>
    </Form>
  );
}
