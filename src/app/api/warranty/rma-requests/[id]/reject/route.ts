import { withErrorHandling } from "@/lib/api/response";
import { rejectRmaRequest } from "@/modules/warranty/api/rma-requests";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return rejectRmaRequest(id);
  }
);
