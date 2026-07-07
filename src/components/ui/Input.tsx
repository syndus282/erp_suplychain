import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

const FIELD_CLASSES =
  "w-full rounded-lg border border-text-disabled/40 bg-surface-solid px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-sm font-medium text-text-primary" {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(FIELD_CLASSES, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx(FIELD_CLASSES, className)} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-semantic-danger">{message}</p>;
}
