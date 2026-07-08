import { withErrorHandling } from "@/lib/api/response";
import { listCustomerInvoices, createCustomerInvoice } from "@/modules/finance/api/customer-invoices";

export const GET = withErrorHandling(listCustomerInvoices);
export const POST = withErrorHandling(createCustomerInvoice);
