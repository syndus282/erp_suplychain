import { withErrorHandling } from "@/lib/api/response";
import { updateCustomer } from "@/modules/distribution/api/customers";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return updateCustomer(request, id);
  }
);
