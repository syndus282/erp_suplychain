import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-primary text-white shadow-[0_4px_14px_-2px_rgba(59,109,240,0.5)] hover:bg-brand-primary-hover hover:shadow-[0_6px_18px_-2px_rgba(59,109,240,0.6)]",
  secondary: "glass-surface-strong text-text-primary hover:bg-surface-glass",
  danger: "bg-semantic-danger text-white shadow-[0_4px_14px_-2px_rgba(220,38,38,0.4)] hover:opacity-90",
  ghost: "text-text-primary hover:bg-surface-glass",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
