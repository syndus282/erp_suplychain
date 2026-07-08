import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-text-disabled/10 bg-surface-solid p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]",
        className
      )}
      {...props}
    />
  );
}
