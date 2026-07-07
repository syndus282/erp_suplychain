import type { HTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("glass-surface rounded-lg p-4 shadow-sm", className)}
      {...props}
    />
  );
}
