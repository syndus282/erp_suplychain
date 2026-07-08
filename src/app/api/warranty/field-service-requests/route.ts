import { withErrorHandling } from "@/lib/api/response";
import { listFieldServiceRequests, createFieldServiceRequest } from "@/modules/warranty/api/field-service-requests";

export const GET = withErrorHandling(listFieldServiceRequests);
export const POST = withErrorHandling(createFieldServiceRequest);
