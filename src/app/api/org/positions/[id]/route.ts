import { withErrorHandling } from "@/lib/api/response";
import { positionsApi } from "@/modules/organization/api/positions";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return positionsApi.update(request, id);
  }
);
