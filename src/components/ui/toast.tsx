/**
 * toast.tsx — compatibility shim
 * shadcn deprecated the radix-based toast component in favor of sonner.
 * This file re-exports the Toaster from sonner.tsx so any import from
 * "@/components/ui/toast" continues to work.
 *
 * For programmatic toasts, import { toast } from "sonner" directly.
 */
export { Toaster } from "@/components/ui/sonner"
