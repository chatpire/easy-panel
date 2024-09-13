"use client";

import * as React from "react";
import * as z from "zod";

import { popup } from "@/components/popup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { APIShareInstanceDataSchema, APIShareModelSchema } from "@/schema/service/api-share.schema";
import { InputTags } from "@/components/custom/input-tags";
import { DataTable, type DataTableDropdownAction } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServiceInstanceSchema = z.object({
  id: z.string(),
  data: APIShareInstanceDataSchema.optional(),
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

interface Props {
  className?: string;
  instanceDetails: ServiceInstanceDetails;
}

export function APIShareModelConfigSheet({ className, instanceDetails }: Props) {
  const { id, data } = instanceDetails;
  const [loading, setLoading] = React.useState(false);
  const [models, setModels] = React.useState(data?.models ?? []);
  const updateDataMutation = api.serviceInstance.updateData.useMutation();

  const form = useForm<z.infer<typeof APIShareModelSchema>>({
    resolver: zodResolver(APIShareModelSchema),
    defaultValues: {
      code: "",
      code_alias: [],
      upstream_model: "",
      tags: [],
      description: "",
      prompt_price: 0,
      completion_price: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof APIShareModelSchema>) => {
    setModels([...models, values]);
    form.reset();
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      await updateDataMutation.mutateAsync({
        id,
        data: {
          ...data,
          models,
        },
      });
      toast.success("模型配置已更新");
    } catch (error) {
      console.error(error);
      toast.error("更新模型配置失败: " + String(error));
    } finally {
      setLoading(false);
    }
  };

  const rowDropdownActions: DataTableDropdownAction<z.infer<typeof APIShareModelSchema>>[] = [
    {
      key: "duplicate",
      content: "复制",
      type: "item",
      onClick: (row) => setModels([...models, { ...row.original, code: `${row.original.code}_copy` }]),
    },
    {
      key: "delete",
      content: <span className="text-red-500">删除</span>,
      type: "item",
      onClick: (row) => setModels(models.filter((model) => model.code !== row.original.code)),
    },
  ];

  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsedModels = JSON.parse(event.target.value);
      const validatedModels = z.array(APIShareModelSchema).parse(parsedModels);
      setModels(validatedModels);
      setJsonError(null);
    } catch (error) {
      setJsonError("JSON 格式或数据结构无效");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className={"my-1 w-full md:w-auto"}>
          <Icons.pencil className="mr-2 h-4 w-4" />
          编辑模型配置
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader className="mb-4">
          <SheetTitle>API Share Models</SheetTitle>
          <SheetDescription>编辑 API Share 实例的模型配置</SheetDescription>
        </SheetHeader>

        <div className="mb-6 grid grid-cols-[1fr,1fr,1fr] gap-4">
          <Card>
            <CardHeader>
              <CardTitle>添加模型</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>模型代码</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code_alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>代码别名</FormLabel>
                        <FormControl>
                          <InputTags {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="upstream_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>上游模型</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标签</FormLabel>
                        <FormControl>
                          <InputTags {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>描述</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prompt_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>提示词价格</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="completion_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>补全价格</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">添加模型</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Models JSON</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              <Textarea value={JSON.stringify(models, null, 2)} onChange={handleJsonChange} className="h-[600px]" />
              {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
            </CardContent>
          </Card>

          <DataTable
            className="h-full"
            data={models}
            schema={APIShareModelSchema}
            rowDropdownActions={rowDropdownActions}
            // defaultPageSize={5}
          />
        </div>

        <LoadingButton loading={loading} onClick={saveChanges} className="w-full">
          保存更改
        </LoadingButton>
      </SheetContent>
    </Sheet>
  );
}
