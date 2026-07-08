import { withErrorHandling } from "@/lib/api/response";
import { listDeliveryCosts, createDeliveryCost } from "@/modules/logistics/api/shipments";

export const GET = withErrorHandling(listDeliveryCosts);
export const POST = withErrorHandling(createDeliveryCost);
