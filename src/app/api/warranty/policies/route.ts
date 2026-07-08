import { withErrorHandling } from "@/lib/api/response";
import { warrantyPolicyApi } from "@/modules/warranty/api/warranty-policies";

export const GET = withErrorHandling(warrantyPolicyApi.list);
export const POST = withErrorHandling(warrantyPolicyApi.create);
