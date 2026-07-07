import { withErrorHandling } from "@/lib/api/response";
import { updateImportShipment } from "@/modules/procurement/api/import-shipments";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updateImportShipment(request, id);
  }
);
