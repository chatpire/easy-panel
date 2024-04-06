"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { api } from "@/trpc/react";
import { UserLoginFormSchema } from "@/schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocalStorage } from "usehooks-ts";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { LoadingButton } from "@/components/loading-button";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean(),
});

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = api.auth.loginByPassword.useMutation();
  const [loading, setLoading] = React.useState(false);
  const [loginFormRemember, saveloginFormRemember] = useLocalStorage<{ username: string; rememberMe: boolean } | null>(
    "easy-panel-login-form-remember",
    null,
    { initializeWithValue: true },
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: loginFormRemember?.username ?? "",
      password: "",
      rememberMe: loginFormRemember?.rememberMe ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.rememberMe) {
      saveloginFormRemember({ username: values.username, rememberMe: true });
    } else {
      saveloginFormRemember(null);
    }
    try {
      setLoading(true);
      form.clearErrors();
      await loginMutation.mutateAsync(UserLoginFormSchema.parse(values));
      form.resetField("password");
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        form.setError("password", { message: error.message });
      } else {
        form.setError("password", { message: "An error occured" });
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={loading} type="submit" className="mt-4 w-full">
          Submit
        </LoadingButton>
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-end space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="text-sm">Remember me</FormLabel>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
