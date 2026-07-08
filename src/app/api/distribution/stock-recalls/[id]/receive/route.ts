import { withErrorHandling } from "@/lib/api/response";
import { receiveStockRecall } from "@/modules/distribution/api/stock-recalls";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return receiveStockRecall(request, id);
  }
);
