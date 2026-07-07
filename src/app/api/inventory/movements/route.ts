import { withErrorHandling } from "@/lib/api/response";
import { listStockMovements } from "@/modules/inventory/api/stock-movements";

export const GET = withErrorHandling(listStockMovements);
