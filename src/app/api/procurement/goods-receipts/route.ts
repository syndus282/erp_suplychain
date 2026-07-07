import { withErrorHandling } from "@/lib/api/response";
import { listGoodsReceipts, createGoodsReceipt } from "@/modules/procurement/api/goods-receipts";

export const GET = withErrorHandling(listGoodsReceipts);
export const POST = withErrorHandling(createGoodsReceipt);
