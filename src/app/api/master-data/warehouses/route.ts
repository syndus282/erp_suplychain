import { withErrorHandling } from "@/lib/api/response";
import { warehousesApi } from "@/modules/master-data/api/warehouses";

export const GET = withErrorHandling(warehousesApi.list);
export const POST = withErrorHandling(warehousesApi.create);
