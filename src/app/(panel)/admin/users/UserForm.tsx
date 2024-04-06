"use client";

import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCreateSchema } from "@/schema/user.schema";
import { Button } from "@/components/ui/button";
import { generateId } from "lucia";
import { LoadingButton } from "@/components/loading-button";

export const CreateUserFormSchema = UserCreateSchema.merge(
  z.object({
    email: z.string().optional(),
    comment: z.string().optional(),
    generateTokens: z.boolean(),
    clearPassword: z.boolean().optional().default(false),
  }),
);

export type CreateUserForm = z.infer<typeof CreateUserFormSchema>;

interface UserFormProps {
  onSubmit: (values: CreateUserForm) => Promise<void>;
  loading: boolean;
  defaultValues?: Partial<CreateUserForm>;
  passwordMode: "input" | "clear";
}

export function UserForm({ onSubmit, loading, defaultValues, passwordMode }: UserFormProps) {
  const form = useForm<CreateUserForm>({
    defaultValues,
    resolver: zodResolver(CreateUserFormSchema),
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

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
        {passwordMode == "input" ? (
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
        ) : (
          <FormField
            control={form.control}
            name="clearPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Clear Password</FormLabel>
                    <FormDescription>Clear password for this user. If password not set, user can login by OIDC only.</FormDescription>
                  </div>
                </div>
              </FormItem>
            )}
          />
        )}

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
