import { withErrorHandling } from "@/lib/api/response";
import { suppliersApi } from "@/modules/procurement/api/suppliers";

export const GET = withErrorHandling(suppliersApi.list);
export const POST = withErrorHandling(suppliersApi.create);
