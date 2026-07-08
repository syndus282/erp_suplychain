import { withErrorHandling } from "@/lib/api/response";
import { listCoreReturns, createCoreReturn } from "@/modules/warranty/api/core-returns";

export const GET = withErrorHandling(listCoreReturns);
export const POST = withErrorHandling(createCoreReturn);
