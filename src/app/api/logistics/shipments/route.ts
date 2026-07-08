import { withErrorHandling } from "@/lib/api/response";
import { listShipments, createShipment } from "@/modules/logistics/api/shipments";

export const GET = withErrorHandling(listShipments);
export const POST = withErrorHandling(createShipment);
