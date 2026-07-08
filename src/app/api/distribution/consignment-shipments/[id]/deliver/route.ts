import { withErrorHandling } from "@/lib/api/response";
import { deliverConsignmentShipment } from "@/modules/distribution/api/consignment-shipments";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return deliverConsignmentShipment(id);
  }
);
