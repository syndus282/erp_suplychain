import { withErrorHandling } from "@/lib/api/response";
import { receiveStockTransfer } from "@/modules/inventory/api/stock-transfers";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return receiveStockTransfer(id);
  }
);
