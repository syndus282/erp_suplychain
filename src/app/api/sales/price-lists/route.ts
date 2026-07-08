import { withErrorHandling } from "@/lib/api/response";
import { priceListApi } from "@/modules/sales/api/price-lists";

export const GET = withErrorHandling(priceListApi.list);
export const POST = withErrorHandling(priceListApi.create);
