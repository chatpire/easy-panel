import { type PaginationInput } from "@/schema/pagination.schema";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractKeysFromSchema(
  schema: z.ZodObject<z.ZodRawShape>,
  maxDepth?: number,
  currentDepth = 1,
  prefix = "",
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
        maxDepth,
        currentDepth + 1,
        newPrefix,
      );
      keys = keys.concat(nestedKeys);
    }
    if (value instanceof z.ZodOptional && value._def.innerType instanceof z.ZodObject) {
      const nestedKeys = extractKeysFromSchema(
        value._def.innerType as z.ZodObject<z.ZodRawShape>,
        maxDepth,
        currentDepth + 1,
        newPrefix,
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

export function alignTimeToGranularity(granularitySeconds: number, time?: Date) {
  if (!time) time = new Date();
  const timeSeconds = Math.floor(time.getTime() / 1000);
  const alignedTimeSeconds = Math.floor(timeSeconds / granularitySeconds) * granularitySeconds;
  return new Date(alignedTimeSeconds * 1000);
}
