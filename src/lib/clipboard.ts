"use client";

import { toast } from "sonner";

export async function copyToClipBoard(text: string | null) {
  if (!text) {
    toast.error("Empty value");
    return;
  }
  await navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}
