import { withErrorHandling } from "@/lib/api/response";
import { costCenterApi } from "@/modules/finance/api/cost-centers";

export const GET = withErrorHandling(costCenterApi.list);
export const POST = withErrorHandling(costCenterApi.create);
