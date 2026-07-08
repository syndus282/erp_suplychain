import { withErrorHandling } from "@/lib/api/response";
import { driverApi } from "@/modules/logistics/api/drivers";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return driverApi.update(request, id);
  }
);
