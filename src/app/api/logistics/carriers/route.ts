import { withErrorHandling } from "@/lib/api/response";
import { carrierApi } from "@/modules/logistics/api/carriers";

export const GET = withErrorHandling(carrierApi.list);
export const POST = withErrorHandling(carrierApi.create);
