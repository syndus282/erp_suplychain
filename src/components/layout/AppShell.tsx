import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  return (
    <div className="flex h-screen gap-3 p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Topbar username={username} />
        <main className="glass-surface flex-1 overflow-y-auto rounded-2xl p-6">{children}</main>
      </div>
    </div>
  );
}
