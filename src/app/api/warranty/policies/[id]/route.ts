import { withErrorHandling } from "@/lib/api/response";
import { warrantyPolicyApi } from "@/modules/warranty/api/warranty-policies";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return warrantyPolicyApi.update(request, id);
  }
);
