import { withErrorHandling } from "@/lib/api/response";
import { allocateSalesOrder } from "@/modules/sales/api/sales-orders";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return allocateSalesOrder(request, id);
  }
);
