import { redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/auth/lib/session";

export default async function RootPage() {
  const session = await getCurrentSession();
  redirect(session ? "/dashboard" : "/login");
}
