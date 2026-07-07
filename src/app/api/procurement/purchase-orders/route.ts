import { withErrorHandling } from "@/lib/api/response";
import { listPurchaseOrders, createPurchaseOrder } from "@/modules/procurement/api/purchase-orders";

export const GET = withErrorHandling(listPurchaseOrders);
export const POST = withErrorHandling(createPurchaseOrder);
