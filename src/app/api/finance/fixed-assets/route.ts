import { withErrorHandling } from "@/lib/api/response";
import { listFixedAssets, createFixedAsset } from "@/modules/finance/api/fixed-assets";

export const GET = withErrorHandling(listFixedAssets);
export const POST = withErrorHandling(createFixedAsset);
