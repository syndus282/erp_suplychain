import { withErrorHandling } from "@/lib/api/response";
import { carrierApi } from "@/modules/logistics/api/carriers";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return carrierApi.update(request, id);
  }
);
