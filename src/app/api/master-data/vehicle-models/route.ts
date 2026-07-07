import { withErrorHandling } from "@/lib/api/response";
import { vehicleModelsApi } from "@/modules/master-data/api/vehicle-models";

export const GET = withErrorHandling(vehicleModelsApi.list);
export const POST = withErrorHandling(vehicleModelsApi.create);
