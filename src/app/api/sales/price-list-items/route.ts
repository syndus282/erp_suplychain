import { withErrorHandling } from "@/lib/api/response";
import { listPriceListItems, createPriceListItem } from "@/modules/sales/api/price-list-items";

export const GET = withErrorHandling(listPriceListItems);
export const POST = withErrorHandling(createPriceListItem);
