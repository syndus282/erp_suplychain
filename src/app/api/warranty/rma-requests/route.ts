import { withErrorHandling } from "@/lib/api/response";
import { listRmaRequests, createRmaRequest } from "@/modules/warranty/api/rma-requests";

export const GET = withErrorHandling(listRmaRequests);
export const POST = withErrorHandling(createRmaRequest);
