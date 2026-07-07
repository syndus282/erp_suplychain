import { withErrorHandling } from "@/lib/api/response";
import { listProducts, createProduct } from "@/modules/master-data/api/products";

export const GET = withErrorHandling(listProducts);
export const POST = withErrorHandling(createProduct);
