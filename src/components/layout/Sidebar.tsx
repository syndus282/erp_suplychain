"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";
import { NAV_GROUPS } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-surface hidden w-64 shrink-0 flex-col overflow-y-auto p-4 md:flex">
      <div className="mb-6 px-2">
        <p className="text-sm font-semibold text-text-primary">ERP Phụ Tùng Ô Tô</p>
        <p className="text-xs text-text-secondary">Chuỗi cung ứng</p>
      </div>

      <nav className="flex flex-1 flex-col gap-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
              {group.label}
            </p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                        active
                          ? "border-l-2 border-brand-primary bg-brand-primary/10 font-medium text-brand-primary"
                          : "text-text-secondary hover:bg-surface-glass hover:text-text-primary"
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
