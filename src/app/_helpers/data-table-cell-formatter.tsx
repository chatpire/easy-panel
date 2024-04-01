"use client";

import { Badge } from "@/components/ui/badge";
import { formatValueToNode } from "@/lib/format";
import { type Row } from "@tanstack/react-table";

export function formatUserDataTableCellValue<T>(key: string, value: any): React.ReactNode {
  if (key === "id") {
    return <Badge variant="secondary">{(value as string).slice(0, 4)}...</Badge>;
  }
  if (key === "role") {
    // return <Badge variant="default">{(value as string).toLowerCase()}</Badge>;
    return (value as string).toLowerCase();
  }
  return formatValueToNode(value);
}

export function camelCaseToTitleCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b./g, (char) => char.toUpperCase());
}
