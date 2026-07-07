import { withErrorHandling } from "@/lib/api/response";
import { uomApi } from "@/modules/master-data/api/uom";

export const GET = withErrorHandling(uomApi.list);
export const POST = withErrorHandling(uomApi.create);
