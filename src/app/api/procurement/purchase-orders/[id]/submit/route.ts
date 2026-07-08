import { withErrorHandling } from "@/lib/api/response";
import { submitPurchaseOrderForApproval } from "@/modules/procurement/api/purchase-orders";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return submitPurchaseOrderForApproval(id);
  }
);
