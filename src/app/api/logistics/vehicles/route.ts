import { withErrorHandling } from "@/lib/api/response";
import { vehicleApi } from "@/modules/logistics/api/vehicles";

export const GET = withErrorHandling(vehicleApi.list);
export const POST = withErrorHandling(vehicleApi.create);
