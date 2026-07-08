import { withErrorHandling } from "@/lib/api/response";
import { rejectLeaveRequest } from "@/modules/hrm/api/leave-requests";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return rejectLeaveRequest(id);
  }
);
