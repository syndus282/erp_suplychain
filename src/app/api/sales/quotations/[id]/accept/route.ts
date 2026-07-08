import { withErrorHandling } from "@/lib/api/response";
import { acceptQuotation } from "@/modules/sales/api/quotations";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return acceptQuotation(id);
  }
);
