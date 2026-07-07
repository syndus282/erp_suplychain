import { withErrorHandling } from "@/lib/api/response";
import { decideApprovalRequest } from "@/modules/workflow/api/approval-requests";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return decideApprovalRequest(request, id);
  }
);
