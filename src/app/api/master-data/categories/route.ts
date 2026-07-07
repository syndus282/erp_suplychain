import { withErrorHandling } from "@/lib/api/response";
import { categoriesApi } from "@/modules/master-data/api/categories";

export const GET = withErrorHandling(categoriesApi.list);
export const POST = withErrorHandling(categoriesApi.create);
