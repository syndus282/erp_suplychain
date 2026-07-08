import { withErrorHandling } from "@/lib/api/response";
import { listWarrantyClaims, createWarrantyClaim } from "@/modules/warranty/api/warranty-claims";

export const GET = withErrorHandling(listWarrantyClaims);
export const POST = withErrorHandling(createWarrantyClaim);
