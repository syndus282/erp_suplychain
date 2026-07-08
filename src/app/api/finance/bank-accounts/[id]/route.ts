import { withErrorHandling } from "@/lib/api/response";
import { bankAccountApi } from "@/modules/finance/api/bank-accounts";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return bankAccountApi.update(request, id);
  }
);
