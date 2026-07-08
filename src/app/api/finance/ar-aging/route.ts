import { withErrorHandling } from "@/lib/api/response";
import { getArAgingReport } from "@/modules/finance/api/ar-aging";

export const GET = withErrorHandling(getArAgingReport);
