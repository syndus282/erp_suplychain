import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentSession } from "@/modules/auth/lib/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return <AppShell username={session.username}>{children}</AppShell>;
}
