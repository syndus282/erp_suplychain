import { withErrorHandling } from "@/lib/api/response";
import { listStockTransfers, createStockTransfer } from "@/modules/inventory/api/stock-transfers";

export const GET = withErrorHandling(listStockTransfers);
export const POST = withErrorHandling(createStockTransfer);
