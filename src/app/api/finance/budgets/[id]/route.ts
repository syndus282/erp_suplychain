import { withErrorHandling } from "@/lib/api/response";
import { budgetApi } from "@/modules/finance/api/budgets";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return budgetApi.update(request, id);
  }
);
