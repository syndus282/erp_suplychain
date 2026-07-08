import { withErrorHandling } from "@/lib/api/response";
import { updatePriceListItem, deletePriceListItem } from "@/modules/sales/api/price-list-items";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updatePriceListItem(request, id);
  }
);

export const DELETE = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return deletePriceListItem(request, id);
  }
);
