import { withErrorHandling } from "@/lib/api/response";
import { listRoles } from "@/modules/org/api/roles";

export const GET = withErrorHandling(listRoles);
