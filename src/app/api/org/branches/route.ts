import { withErrorHandling } from "@/lib/api/response";
import { branchesApi } from "@/modules/organization/api/branches";

export const GET = withErrorHandling(branchesApi.list);
export const POST = withErrorHandling(branchesApi.create);
