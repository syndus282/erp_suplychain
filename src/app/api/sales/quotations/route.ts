import { withErrorHandling } from "@/lib/api/response";
import { listQuotations, createQuotation } from "@/modules/sales/api/quotations";

export const GET = withErrorHandling(listQuotations);
export const POST = withErrorHandling(createQuotation);
