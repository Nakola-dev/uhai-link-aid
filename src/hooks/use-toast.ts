import type { ReactNode } from "react";
import { toast as sonner } from "sonner";

/**
 * Compatibility adapter: the app uses a single toast system (sonner). Older pages
 * call `useToast().toast({ title, description, variant })`; this forwards those calls
 * to sonner so the Radix toast stack no longer ships on every page. New code should
 * import `toast` from "sonner" directly.
 */
interface ToastInput {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
}

function toast({ title, description, variant }: ToastInput) {
  const show = variant === "destructive" ? sonner.error : sonner.success;
  return title ? show(title, { description }) : show(description);
}

function useToast() {
  return { toast };
}

export { useToast, toast };
