import { withErrorHandling } from "@/lib/api/response";
import { contractApi } from "@/modules/contracts/api/contracts";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return contractApi.update(request, id);
  }
);
