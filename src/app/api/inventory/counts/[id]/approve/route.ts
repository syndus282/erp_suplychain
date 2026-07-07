import { withErrorHandling } from "@/lib/api/response";
import { approveStockCount } from "@/modules/inventory/api/stock-counts";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return approveStockCount(id);
  }
);
