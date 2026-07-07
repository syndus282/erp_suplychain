import { withErrorHandling } from "@/lib/api/response";
import { updateStorageLocation } from "@/modules/master-data/api/storage-locations";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updateStorageLocation(request, id);
  }
);
