import { withErrorHandling } from "@/lib/api/response";
import { listApprovalRequests } from "@/modules/workflow/api/approval-requests";

export const GET = withErrorHandling(listApprovalRequests);
