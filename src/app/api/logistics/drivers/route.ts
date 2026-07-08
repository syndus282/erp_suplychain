import { withErrorHandling } from "@/lib/api/response";
import { driverApi } from "@/modules/logistics/api/drivers";

export const GET = withErrorHandling(driverApi.list);
export const POST = withErrorHandling(driverApi.create);
