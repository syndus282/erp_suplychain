import { withErrorHandling } from "@/lib/api/response";
import { listWarrantyRegistrations, createWarrantyRegistration } from "@/modules/warranty/api/warranty-registrations";

export const GET = withErrorHandling(listWarrantyRegistrations);
export const POST = withErrorHandling(createWarrantyRegistration);
