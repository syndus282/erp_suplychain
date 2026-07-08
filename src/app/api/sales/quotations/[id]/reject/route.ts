import { withErrorHandling } from "@/lib/api/response";
import { rejectQuotation } from "@/modules/sales/api/quotations";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return rejectQuotation(id);
  }
);
