import { withErrorHandling } from "@/lib/api/response";
import { approvalMatrixApi } from "@/modules/workflow/api/approval-matrix";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return approvalMatrixApi.update(request, id);
  }
);
