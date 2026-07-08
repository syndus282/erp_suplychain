import { withErrorHandling } from "@/lib/api/response";
import { receiveSalesReturn } from "@/modules/sales/api/sales-returns";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return receiveSalesReturn(request, id);
  }
);
