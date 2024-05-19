"use client";

import * as React from "react";
import * as z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import poeBots from "@/resources/poekmon-bots.json";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { copyToClipBoard } from "@/lib/clipboard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ServiceInstanceSchema = z.object({
  id: z.string(),
  token: z.string(),
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

const PoekmonAPIUsageFormSchema = z.object({
  model: z.string().optional(),
  stream: z.boolean(),
});

interface InstanceConfigDetailsProps {
  className?: string;
  instanceDetails: ServiceInstanceDetails;
}

export function PoekmonAPIConfigSheet({ instanceDetails }: InstanceConfigDetailsProps) {
  const { id, token } = instanceDetails;
  const [baseUrl, setBaseUrl] = React.useState("<base_url>");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  const form = useForm<z.infer<typeof PoekmonAPIUsageFormSchema>>({
    defaultValues: {
      model: "gpt-4o",
      stream: false,
    },
    resolver: zodResolver(PoekmonAPIUsageFormSchema),
  });

  const systemPrompt = "You are a helpful assistant.";
  const userPrompt = "Hello!";

  const codeExampleMap: Record<string, string> = {
    curl: `curl -X 'POST' \\
  '${baseUrl}/api/poekmon/${id}/v1/chat/completions' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${token}' \\
  -d '{
  "model": "${form.watch("model")}",
  "messages": [
    {
      "role": "system", 
      "content": "${systemPrompt}"
    },
    {
      "role": "user",
      "content": "${userPrompt}"
    }
  ],
  "stream": ${String(form.watch("stream"))}
  }'`,

    "python request": `import requests
  
url = "${baseUrl}/api/poekmon/${id}/v1/chat/completions"

payload = {
    "model": "${form.watch("model")}",
    "messages": [
        {"role": "system", "content": "${systemPrompt}"},
        {"role": "user", "content": "${userPrompt}"}
    ],
    "stream": ${form.watch("stream") ? "True" : "False"}
}
headers = {
    "accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer ${token}"
}

${
  form.watch("stream")
    ? `with requests.post(url, json=payload, headers=headers, stream=True) as response:
    for chunk in response.iter_content():
        print(chunk)`
    : `response = requests.post(url, json=payload, headers=headers)`
}`,

    "python openai": `import openai

from openai import OpenAI
client = OpenAI(api_key="${token}", base_url="${baseUrl}/api/poekmon/${id}/v1")

completion = client.chat.completions.create(
    model="${form.watch("model")}",
    messages=[
        {"role": "system", "content": "${systemPrompt}"},
        {"role": "user", "content": "${userPrompt}"}
    ],
    stream=${form.watch("stream") ? "True" : "False"}
)

${
  form.watch("stream")
    ? `for chunk in completion:
    if len(chunk.choices) > 0 and chunk.choices[0].delta:
        print(chunk.choices[0].delta)`
    : `print(completion.choices[0].message)`
}`,
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className={"my-1 w-full md:w-auto"}>
          <Icons.eye className="mr-2 h-4 w-4" />
          查看使用说明
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>使用说明</SheetTitle>
          <SheetDescription>Poe API 使用说明</SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-col space-y-6 w-full">
          <div className="w-full items-center space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <div className="flex flex-row space-x-3">
              <Input className="w-full" id="api-url" value={`${baseUrl}/api/poekmon/${id}`} readOnly />
              <Button variant={"ghost"} onClick={() => copyToClipBoard(`${baseUrl}/api/poekmon/${id}`)}>
                <Icons.copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-full items-center space-y-2">
            <Label htmlFor="api-token">API Token</Label>
            <div className="flex flex-row space-x-3">
              <Input className="w-full" id="api-token" value={token} readOnly />
              <Button variant={"ghost"} onClick={() => copyToClipBoard(token)}>
                <Icons.copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Form {...form}>
            <form key={id} className="space-y-8">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Model</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="">
                          {poeBots.map((option) => (
                            <SelectItem key={option.id} value={option.handle.toLowerCase()}>
                              <span>{option.displayName}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {poeBots.filter((option) => option.handle.toLowerCase() === field.value)[0]?.description ??
                        "选择模型"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stream"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between ">
                    <div className="space-y-0.5">
                      <FormLabel>Stream</FormLabel>
                      <FormDescription>使用流式传输</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {Object.keys(codeExampleMap).map((lang) => (
                <TabsTrigger key={lang} value={lang}>
                  {lang}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(codeExampleMap).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">{code}</pre>
                  <button
                    className="absolute right-2 top-2 rounded-md p-2 hover:bg-muted"
                    onClick={() => copyToClipBoard(code)}
                  >
                    <Icons.copy className="h-4 w-4" />
                  </button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
