import { withErrorHandling } from "@/lib/api/response";
import { approvalMatrixApi } from "@/modules/workflow/api/approval-matrix";

export const GET = withErrorHandling(approvalMatrixApi.list);
export const POST = withErrorHandling(approvalMatrixApi.create);
