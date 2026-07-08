"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/modules/workflow/components/NotificationBell";

export function Topbar({ username }: { username: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="glass-surface relative z-20 flex h-14 shrink-0 items-center justify-between rounded-2xl px-4">
      <div />
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="text-sm text-text-secondary">{username}</span>
        <Button variant="ghost" onClick={handleLogout} className="gap-1.5">
          <LogOut size={16} />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
