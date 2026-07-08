import { withErrorHandling } from "@/lib/api/response";
import { budgetApi } from "@/modules/finance/api/budgets";

export const GET = withErrorHandling(budgetApi.list);
export const POST = withErrorHandling(budgetApi.create);
