import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
  secondary: "glass-surface text-text-primary hover:bg-surface-glass/80",
  danger: "bg-semantic-danger text-white hover:opacity-90",
  ghost: "text-text-primary hover:bg-surface-glass",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
