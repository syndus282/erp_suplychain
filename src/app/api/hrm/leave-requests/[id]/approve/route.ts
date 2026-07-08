import { withErrorHandling } from "@/lib/api/response";
import { approveLeaveRequest } from "@/modules/hrm/api/leave-requests";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return approveLeaveRequest(id);
  }
);
