import { withErrorHandling } from "@/lib/api/response";
import { listPayments, createPayment } from "@/modules/finance/api/payments";

export const GET = withErrorHandling(listPayments);
export const POST = withErrorHandling(createPayment);
