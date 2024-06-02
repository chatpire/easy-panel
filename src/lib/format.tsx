"use client";

import { popup } from "@/components/popup";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function formatValueToNode(key: string, value: unknown): React.ReactNode {
  if (value === null) {
    return <span className="text-muted-foreground"> null </span>;
  }
  if (value instanceof Date) {
    return <span className="text-muted-foreground">{value.toLocaleString()}</span>;
  }
  if (key === "text" || key.endsWith("query")) {
    const text = value as string;
    return (
      <Button
        variant="ghost"
        className="p-2 text-xs"
        onClick={() => {
          popup({
            title: key,
            description: "Text",
            content: () => (
              <ScrollArea className="max-h-[300px] w-full">
                <div className="text-sm">{text}</div>
              </ScrollArea>
            ),
          });
        }}
      >
        {text.substring(0, 50) + (text.length > 50 ? "..." : "")}
      </Button>
    );
  }
  if (value instanceof Object) {
    const jsonStr = JSON.stringify(value);
    return (
      <Button
        variant="ghost"
        className="p-2 text-xs "
        onClick={() => {
          popup({
            title: key,
            description: "JSON",
            content: () => (
              <ScrollArea className="h-[400px]">
                <div className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</div>
              </ScrollArea>
            ),
          });
        }}
      >
        {jsonStr.substring(0, 100) + (jsonStr.length > 100 ? "..." : "")}
      </Button>
    );
  }
  return formatValueToString(value);
}

export function formatValueToString(value: unknown): string {
  if (value instanceof Date) {
    return value.toLocaleString();
  } else if (Array.isArray(value)) {
    return value.map((item) => formatValueToString(item)).join(", ");
  } else if (value === null) {
    return "null";
  } else if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  } else if (typeof value === "undefined") {
    return "undefined";
  } else if (typeof value === "number") {
    return value.toString();
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "symbol") {
    return value.toString();
  } else if (typeof value === "function") {
    return "function";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return "unknown";
  }
}

export function camelCaseToTitleCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b./g, (char) => char.toUpperCase());
}
