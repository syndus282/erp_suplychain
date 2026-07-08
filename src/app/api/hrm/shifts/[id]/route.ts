import { withErrorHandling } from "@/lib/api/response";
import { shiftApi } from "@/modules/hrm/api/shifts";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return shiftApi.update(request, id);
  }
);
