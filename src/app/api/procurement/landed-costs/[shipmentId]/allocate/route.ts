import { withErrorHandling } from "@/lib/api/response";
import { allocateLandedCosts } from "@/modules/procurement/api/landed-costs";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ shipmentId: string }> }) => {
    const { shipmentId } = await context.params;
    return allocateLandedCosts(shipmentId);
  }
);
