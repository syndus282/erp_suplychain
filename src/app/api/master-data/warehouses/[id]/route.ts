import { withErrorHandling } from "@/lib/api/response";
import { warehousesApi } from "@/modules/master-data/api/warehouses";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return warehousesApi.update(request, id);
  }
);
