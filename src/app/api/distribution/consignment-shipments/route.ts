import { withErrorHandling } from "@/lib/api/response";
import { listConsignmentShipments, createConsignmentShipment } from "@/modules/distribution/api/consignment-shipments";

export const GET = withErrorHandling(listConsignmentShipments);
export const POST = withErrorHandling(createConsignmentShipment);
