import { withErrorHandling } from "@/lib/api/response";
import { createDeliveryRequestFromSalesOrder } from "@/modules/logistics/api/delivery-requests";

export const POST = withErrorHandling(createDeliveryRequestFromSalesOrder);
