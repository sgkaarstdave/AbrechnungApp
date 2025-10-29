"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

export type ToastOptions = ExternalToast;

export function useToast() {
  return {
    toast: sonnerToast
  };
}

export const toast = sonnerToast;
