import { withErrorHandling } from "@/lib/api/response";
import { listImportShipments, createImportShipment } from "@/modules/procurement/api/import-shipments";

export const GET = withErrorHandling(listImportShipments);
export const POST = withErrorHandling(createImportShipment);
