"use client";

import * as React from "react";
import * as z from "zod";

import { useForm } from "react-hook-form";
import { type PoekmonAPIInstanceDataSchema } from "@/schema/service/poekmon-api.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingButton } from "@/components/loading-button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { PoeAccountCookieSchema, PoekmonSharedInstanceDataSchema } from "@/schema/service/poekmon-shared.schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

const ServiceInstanceSchema = z.object({
  id: z.string(),
  data: PoekmonSharedInstanceDataSchema,
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

export function PoekmonSharedCookieConfigSheet({ instanceDetails }: { instanceDetails: ServiceInstanceDetails }) {
  const { id, data } = instanceDetails;
  const [loading, setLoading] = React.useState(false);
  const updateDataMutation = api.serviceInstance.updateData.useMutation();

  const formSchema = z.object({
    currentCookies: z.array(PoeAccountCookieSchema),
    cookieText: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: data
      ? {
          currentCookies: data.poe_cookies,
          cookieText: "",
        }
      : {
          currentCookies: [],
          cookieText: "",
        },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const newData = {
        ...data,
        poe_cookies: values.currentCookies,
      };
      await updateDataMutation.mutateAsync({
        id,
        data: newData,
      });
      toast.success("Instance configuration updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update instance configuration: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  type ParsedCookie = {
    name: string;
    value: string;
    path: string;
    expirationDate: number;
  };

  const parseCookies = (cookieText: string) => {
    try {
      const cookies = JSON.parse(cookieText) as ParsedCookie[] | undefined;
      if (!cookies) {
        throw new Error("Invalid JSON");
      }
      const parsedCookies = cookies.filter((cookie) => ["p-lat", "p-b"].includes(cookie.name) && cookie.value && cookie.expirationDate)
      .map((cookie: ParsedCookie) => ({
        name: cookie.name,
        value: cookie.value,
        expired_at: cookie.expirationDate * 1000,
      }));
      form.setValue("currentCookies", parsedCookies);
      console.log(parsedCookies);
    } catch (error) {
      console.error("Failed to parse cookies:", error);
      form.setValue("currentCookies", form.getValues("currentCookies"));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="my-1 w-full md:w-auto">
          <Icons.settings className="mr-2 h-4 w-4" />
          Cookies
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configure Cookies</SheetTitle>
          <SheetDescription>设置 Poe 账户 cookies</SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col space-y-6">
          <Form {...form}>
            <form key={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="currentCookies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Cookies</FormLabel>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Expired At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {field.value.map((cookie, index) => (
                          <TableRow key={index}>
                            <TableCell>{cookie.name}</TableCell>
                            <TableCell>{cookie.value}</TableCell>
                            <TableCell>{cookie.expired_at ? new Date(cookie.expired_at).toLocaleString() : "-"}</TableCell>
                          </TableRow>
                        ))}
                        {field.value.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3}>
                              <div className="text-center">No cookies found</div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cookieText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cookie Text</FormLabel>
                    <Textarea
                      placeholder="Paste cookie JSON here"
                      {...field}
                      className="h-32"
                      onChange={(e) => {
                        field.onChange(e);
                        parseCookies(e.target.value);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton loading={loading} type="submit">
                Submit
              </LoadingButton>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}