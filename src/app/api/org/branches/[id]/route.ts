import { withErrorHandling } from "@/lib/api/response";
import { branchesApi } from "@/modules/organization/api/branches";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return branchesApi.update(request, id);
  }
);
