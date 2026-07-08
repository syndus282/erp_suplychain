import { withErrorHandling } from "@/lib/api/response";
import { listRepairOrders } from "@/modules/warranty/api/repair-orders";

export const GET = withErrorHandling(listRepairOrders);
