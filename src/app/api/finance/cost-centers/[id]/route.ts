import { withErrorHandling } from "@/lib/api/response";
import { costCenterApi } from "@/modules/finance/api/cost-centers";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return costCenterApi.update(request, id);
  }
);
