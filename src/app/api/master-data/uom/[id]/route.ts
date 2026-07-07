import { withErrorHandling } from "@/lib/api/response";
import { uomApi } from "@/modules/master-data/api/uom";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return uomApi.update(request, id);
  }
);
