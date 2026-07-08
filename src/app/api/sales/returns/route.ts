import { withErrorHandling } from "@/lib/api/response";
import { listSalesReturns, createSalesReturn } from "@/modules/sales/api/sales-returns";

export const GET = withErrorHandling(listSalesReturns);
export const POST = withErrorHandling(createSalesReturn);
