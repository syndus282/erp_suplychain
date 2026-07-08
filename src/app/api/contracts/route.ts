import { withErrorHandling } from "@/lib/api/response";
import { contractApi } from "@/modules/contracts/api/contracts";

export const GET = withErrorHandling(contractApi.list);
export const POST = withErrorHandling(contractApi.create);
