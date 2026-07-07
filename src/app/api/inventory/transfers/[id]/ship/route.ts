import { withErrorHandling } from "@/lib/api/response";
import { shipStockTransfer } from "@/modules/inventory/api/stock-transfers";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return shipStockTransfer(id);
  }
);
