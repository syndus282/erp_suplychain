import { withErrorHandling } from "@/lib/api/response";
import { listPurchaseRequests, createPurchaseRequest } from "@/modules/procurement/api/purchase-requests";

export const GET = withErrorHandling(listPurchaseRequests);
export const POST = withErrorHandling(createPurchaseRequest);
