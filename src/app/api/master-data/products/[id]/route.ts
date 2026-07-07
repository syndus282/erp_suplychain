import { withErrorHandling } from "@/lib/api/response";
import { updateProduct } from "@/modules/master-data/api/products";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updateProduct(request, id);
  }
);
