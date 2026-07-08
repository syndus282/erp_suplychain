import { withErrorHandling } from "@/lib/api/response";
import { approveSalesReturn } from "@/modules/sales/api/sales-returns";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return approveSalesReturn(id);
  }
);
