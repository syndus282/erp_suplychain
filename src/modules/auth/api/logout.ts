import { apiSuccess } from "@/lib/api/response";
import { clearSessionCookie } from "../lib/session";

export async function logoutHandler(): Promise<Response> {
  await clearSessionCookie();
  return apiSuccess({ loggedOut: true });
}
