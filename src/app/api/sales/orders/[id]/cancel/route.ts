import { withErrorHandling } from "@/lib/api/response";
import { cancelSalesOrder } from "@/modules/sales/api/sales-orders";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return cancelSalesOrder(id);
  }
);
