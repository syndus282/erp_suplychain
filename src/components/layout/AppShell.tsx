import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ username, children }: { username: string; children: ReactNode }) {
  return (
    <div className="flex h-screen bg-surface-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar username={username} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
