import { withErrorHandling } from "@/lib/api/response";
import { listAuditLogs } from "@/modules/workflow/api/audit-logs";

export const GET = withErrorHandling(listAuditLogs);
