import { withErrorHandling } from "@/lib/api/response";
import { listCustomers, createCustomer } from "@/modules/distribution/api/customers";

export const GET = withErrorHandling(listCustomers);
export const POST = withErrorHandling(createCustomer);
