import { withErrorHandling } from "@/lib/api/response";
import { categoriesApi } from "@/modules/master-data/api/categories";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return categoriesApi.update(request, id);
  }
);
