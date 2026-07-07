import { withErrorHandling } from "@/lib/api/response";
import { listStockCounts, createStockCount } from "@/modules/inventory/api/stock-counts";

export const GET = withErrorHandling(listStockCounts);
export const POST = withErrorHandling(createStockCount);
