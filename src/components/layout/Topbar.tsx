"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Topbar({ username }: { username: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="glass-surface flex h-14 items-center justify-between px-4">
      <div />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Thông báo"
          className="rounded-lg p-2 text-text-secondary hover:bg-surface-glass hover:text-text-primary"
        >
          <Bell size={18} />
        </button>
        <span className="text-sm text-text-secondary">{username}</span>
        <Button variant="ghost" onClick={handleLogout} className="gap-1.5">
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
