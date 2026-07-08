import { withErrorHandling } from "@/lib/api/response";
import { listSalesOrders, createSalesOrder } from "@/modules/sales/api/sales-orders";

export const GET = withErrorHandling(listSalesOrders);
export const POST = withErrorHandling(createSalesOrder);
