import { withErrorHandling } from "@/lib/api/response";
import { departmentsApi } from "@/modules/organization/api/departments";

export const GET = withErrorHandling(departmentsApi.list);
export const POST = withErrorHandling(departmentsApi.create);
