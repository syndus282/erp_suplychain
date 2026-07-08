import { withErrorHandling } from "@/lib/api/response";
import { vehicleApi } from "@/modules/logistics/api/vehicles";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return vehicleApi.update(request, id);
  }
);
