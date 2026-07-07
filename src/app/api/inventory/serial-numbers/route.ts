import { withErrorHandling } from "@/lib/api/response";
import { listSerialNumbers } from "@/modules/inventory/api/serial-numbers";

export const GET = withErrorHandling(listSerialNumbers);
