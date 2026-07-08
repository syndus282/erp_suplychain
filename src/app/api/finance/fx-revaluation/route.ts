import { withErrorHandling } from "@/lib/api/response";
import { revalueForeignCurrencyBalances } from "@/modules/finance/api/fx-revaluation";

export const POST = withErrorHandling(revalueForeignCurrencyBalances);
