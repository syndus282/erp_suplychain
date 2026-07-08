import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface-solid">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-text-disabled/20 text-left text-xs font-medium text-text-secondary">{children}</thead>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-text-disabled/10 odd:bg-black/[0.015] hover:bg-brand-primary/5 last:border-b-0 dark:odd:bg-white/[0.02]">{children}</tr>;
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-text-primary ${className ?? ""}`}>{children}</td>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-4 py-10 text-center text-sm text-text-secondary">{message}</p>;
}
