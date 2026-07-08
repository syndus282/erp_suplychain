import { withErrorHandling } from "@/lib/api/response";
import { listConsignmentSalesReports, createConsignmentSalesReport } from "@/modules/distribution/api/consignment-sales-reports";

export const GET = withErrorHandling(listConsignmentSalesReports);
export const POST = withErrorHandling(createConsignmentSalesReport);
