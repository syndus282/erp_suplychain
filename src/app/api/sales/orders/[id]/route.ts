import { withErrorHandling } from "@/lib/api/response";
import { getSalesOrder } from "@/modules/sales/api/sales-orders";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return getSalesOrder(id);
  }
);
