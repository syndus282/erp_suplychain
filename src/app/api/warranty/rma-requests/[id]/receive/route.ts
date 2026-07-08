import { withErrorHandling } from "@/lib/api/response";
import { receiveRmaRequest } from "@/modules/warranty/api/rma-requests";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return receiveRmaRequest(request, id);
  }
);
