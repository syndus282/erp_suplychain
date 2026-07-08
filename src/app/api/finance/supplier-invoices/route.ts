import { withErrorHandling } from "@/lib/api/response";
import { listSupplierInvoices, createSupplierInvoice } from "@/modules/finance/api/supplier-invoices";

export const GET = withErrorHandling(listSupplierInvoices);
export const POST = withErrorHandling(createSupplierInvoice);
