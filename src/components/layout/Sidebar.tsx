"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ChevronDown, ChevronLeft } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { NAV_GROUPS, type NavGroup } from "./nav-config";

function findActiveGroup(pathname: string): NavGroup {
  return (
    NAV_GROUPS.find((group) =>
      group.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    ) ?? NAV_GROUPS[0]
  );
}

/**
 * Sidebar 2 cấp: mặc định hiển thị menu con của module đang đứng (đỡ rối vì
 * trước đây liệt kê hết ~13 module x nhiều mục cùng lúc). Bấm vào tiêu đề
 * module để mở "màn hình chọn module" — chọn module khác sẽ điều hướng tới
 * mục đầu tiên của module đó.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeGroup = findActiveGroup(pathname);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Đổi trang (kể cả do chọn module khác) thì luôn quay lại view menu con.
  useEffect(() => {
    setPickerOpen(false);
  }, [pathname]);

  function openGroup(group: NavGroup) {
    router.push(group.items[0].href);
  }

  return (
    <aside className="glass-surface hidden w-64 shrink-0 flex-col overflow-y-auto rounded-2xl p-4 md:flex">
      <button
        type="button"
        onClick={() => setPickerOpen((prev) => !prev)}
        className="mb-4 flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-surface-glass"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
          <LayoutGrid size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {pickerOpen ? "Chọn module" : activeGroup.label}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {pickerOpen ? "ERP Phụ Tùng Ô Tô" : "Bấm để đổi module"}
          </p>
        </div>
        <ChevronDown size={16} className={clsx("shrink-0 text-text-secondary transition", pickerOpen && "rotate-180")} />
      </button>

      {pickerOpen ? (
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = group.label === activeGroup.label;
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => openGroup(group)}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                  isActive
                    ? "glass-surface-strong font-medium text-brand-primary shadow-sm"
                    : "text-text-secondary hover:bg-surface-glass hover:text-text-primary"
                )}
              >
                <Icon size={18} />
                {group.label}
              </button>
            );
          })}
        </nav>
      ) : (
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {activeGroup.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? "glass-surface-strong font-medium text-brand-primary shadow-sm"
                    : "text-text-secondary hover:bg-surface-glass hover:text-text-primary"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-glass hover:text-text-primary"
          >
            <ChevronLeft size={16} />
            Tất cả module
          </button>
        </nav>
      )}
    </aside>
  );
}
