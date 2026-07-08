import { withErrorHandling } from "@/lib/api/response";
import { consignmentAgreementsApi } from "@/modules/distribution/api/consignment-agreements";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return consignmentAgreementsApi.update(request, id);
  }
);
