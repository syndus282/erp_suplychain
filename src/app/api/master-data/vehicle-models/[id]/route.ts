import { withErrorHandling } from "@/lib/api/response";
import { vehicleModelsApi } from "@/modules/master-data/api/vehicle-models";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return vehicleModelsApi.update(request, id);
  }
);
