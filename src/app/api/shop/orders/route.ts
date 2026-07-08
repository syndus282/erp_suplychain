import { withErrorHandling } from "@/lib/api/response";
import { createOnlineOrder } from "@/modules/shop/api/orders";

export const POST = withErrorHandling(createOnlineOrder);
