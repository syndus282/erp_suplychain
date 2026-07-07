import { apiSuccess } from "@/lib/api/response";
import { requireAuthenticated } from "../lib/permissions";
import { getCurrentSession } from "../lib/session";

export async function meHandler(): Promise<Response> {
  const session = await getCurrentSession();
  requireAuthenticated(session);

  return apiSuccess({
    id: session.sub,
    username: session.username,
    companyId: session.companyId,
    employeeId: session.employeeId,
    roles: session.roles,
    permissions: session.permissions,
  });
}
