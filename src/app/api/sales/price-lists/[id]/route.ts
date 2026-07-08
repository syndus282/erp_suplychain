import { withErrorHandling } from "@/lib/api/response";
import { priceListApi } from "@/modules/sales/api/price-lists";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return priceListApi.update(request, id);
  }
);
