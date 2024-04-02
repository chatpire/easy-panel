import { type PaginationInput } from "@/schema/pagination.schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractKeysFromSchema(
  schema: z.ZodObject<z.ZodRawShape>,
  currentDepth = 1,
  prefix = "",
  maxDepth?: number,
): string[] {
  let keys: string[] = [];
  if (maxDepth && currentDepth > maxDepth) return keys;

  for (const key in schema.shape) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    keys.push(newPrefix);
    const value = schema.shape[key];
    if (value instanceof z.ZodObject) {
      const nestedKeys = extractKeysFromSchema(
        value as z.ZodObject<z.ZodRawShape>,
        currentDepth + 1,
        newPrefix,
        maxDepth,
      );
      keys = keys.concat(nestedKeys);
    }
  }

  return keys;
}

export function computeSkip(paginationInput: PaginationInput) {
  const { currentPage, pageSize } = paginationInput;
  const skip = Math.max(0, (currentPage ?? 1) - 1) * pageSize;
  return skip;
}
