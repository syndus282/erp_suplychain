import { withErrorHandling } from "@/lib/api/response";
import { listStockRecalls, createStockRecall } from "@/modules/distribution/api/stock-recalls";

export const GET = withErrorHandling(listStockRecalls);
export const POST = withErrorHandling(createStockRecall);
