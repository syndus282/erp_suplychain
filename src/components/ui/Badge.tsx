import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-semantic-success/15 text-semantic-success",
  warning: "bg-semantic-warning/15 text-semantic-warning",
  danger: "bg-semantic-danger/15 text-semantic-danger",
  info: "bg-semantic-info/15 text-semantic-info",
  neutral: "bg-text-secondary/15 text-text-secondary",
};

/** Map nhóm status Prisma enum sang tone badge — theo docs/design-system.md mục 2.2. */
const STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: "success",
  COMPLETED: "success",
  APPROVED: "success",
  PAID: "success",
  DELIVERED: "success",
  CLOSED: "success",
  CONFIRMED: "success",
  ACCEPTED: "success",
  REFUNDED: "success",
  INVOICED: "success",

  PENDING_APPROVAL: "warning",
  PARTIALLY_RECEIVED: "warning",
  PARTIALLY_PAID: "warning",
  PENDING: "warning",
  REQUESTED: "warning",
  RECEIVED: "warning",
  QC_DONE: "warning",
  EXPIRED: "warning",

  REJECTED: "danger",
  CANCELLED: "danger",
  OVERDUE: "danger",
  FAILED: "danger",
  INACTIVE: "danger",
  LOCKED: "danger",
  DISABLED: "danger",

  DRAFT: "info",
  SHIPPING: "info",
  IN_PROGRESS: "info",
  SENT: "info",
  ALLOCATED: "info",
  PICKING: "info",
};

export function toneForStatus(status: string): BadgeTone {
  return STATUS_TONE[status] ?? "neutral";
}

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={toneForStatus(status)}>{status}</Badge>;
}
