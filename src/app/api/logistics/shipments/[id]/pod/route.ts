import { withErrorHandling } from "@/lib/api/response";
import { recordProofOfDelivery } from "@/modules/logistics/api/shipments";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return recordProofOfDelivery(request, id);
  }
);
