import { withErrorHandling } from "@/lib/api/response";
import { suppliersApi } from "@/modules/procurement/api/suppliers";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return suppliersApi.update(request, id);
  }
);
