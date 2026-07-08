import { withErrorHandling } from "@/lib/api/response";
import { accountApi } from "@/modules/finance/api/accounts";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return accountApi.update(request, id);
  }
);
