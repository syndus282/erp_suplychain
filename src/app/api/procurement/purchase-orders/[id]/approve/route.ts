import { withErrorHandling } from "@/lib/api/response";
import { approvePurchaseOrder } from "@/modules/procurement/api/purchase-orders";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return approvePurchaseOrder(id);
  }
);
