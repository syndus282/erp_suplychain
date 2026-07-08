"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

const POLL_INTERVAL_MS = 30_000;

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/workflow/notifications");
    const body = await res.json();
    if (body.success) {
      setItems(body.data.items);
      setUnreadCount(body.data.unreadCount);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleOpen() {
    setOpen((prev) => !prev);
  }

  async function markRead(id: string) {
    await fetch(`/api/workflow/notifications/${id}/read`, { method: "POST" });
    load();
  }

  async function markAllRead() {
    await fetch("/api/workflow/notifications/read-all", { method: "POST" });
    load();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Thông báo"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-glass hover:text-text-primary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-semantic-danger px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-text-disabled/10 bg-surface-solid p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-text-primary">Thông báo</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-brand-primary hover:underline">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="mt-1 max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-text-secondary">Không có thông báo nào</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !item.isRead && markRead(item.id)}
                  className={`block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-glass ${
                    item.isRead ? "text-text-secondary" : "font-medium text-text-primary"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!item.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{item.title}</p>
                      {item.message && <p className="truncate text-xs text-text-secondary">{item.message}</p>}
                      <p className="text-[11px] text-text-disabled">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
