import { withErrorHandling } from "@/lib/api/response";
import { convertQuotationToSalesOrder } from "@/modules/sales/api/quotations";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return convertQuotationToSalesOrder(id);
  }
);
