import { withErrorHandling } from "@/lib/api/response";
import { dispatchShipment } from "@/modules/logistics/api/shipments";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return dispatchShipment(id);
  }
);
