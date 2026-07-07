import { withErrorHandling } from "@/lib/api/response";
import { listInventoryBalances } from "@/modules/inventory/api/inventory-balances";

export const GET = withErrorHandling(listInventoryBalances);
