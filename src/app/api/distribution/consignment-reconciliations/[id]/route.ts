import { withErrorHandling } from "@/lib/api/response";
import { updateConsignmentReconciliation } from "@/modules/distribution/api/consignment-reconciliations";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updateConsignmentReconciliation(request, id);
  }
);
