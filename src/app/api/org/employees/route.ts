import { withErrorHandling } from "@/lib/api/response";
import { employeesApi } from "@/modules/organization/api/employees";

export const GET = withErrorHandling(employeesApi.list);
export const POST = withErrorHandling(employeesApi.create);
