import { withErrorHandling } from "@/lib/api/response";
import { positionsApi } from "@/modules/organization/api/positions";

export const GET = withErrorHandling(positionsApi.list);
export const POST = withErrorHandling(positionsApi.create);
