import { withErrorHandling } from "@/lib/api/response";
import { listDeliveryRequests } from "@/modules/logistics/api/delivery-requests";

export const GET = withErrorHandling(listDeliveryRequests);
