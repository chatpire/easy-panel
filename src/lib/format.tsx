"use client";

export function formatValueToNode(value: unknown): React.ReactNode {
  if (value === null) {
    return <span className="text-gray-400"> null </span>;
  }
  if (value instanceof Date) {
    return <span className="text-xs">{value.toLocaleString()}</span>;
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
