import { withErrorHandling } from "@/lib/api/response";
import { listPublicProducts } from "@/modules/shop/api/catalog";

export const GET = withErrorHandling(listPublicProducts);
