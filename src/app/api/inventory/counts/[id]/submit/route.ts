import { withErrorHandling } from "@/lib/api/response";
import { submitStockCount } from "@/modules/inventory/api/stock-counts";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return submitStockCount(request, id);
  }
);
