import { withErrorHandling } from "@/lib/api/response";
import { listLandedCosts, createLandedCost } from "@/modules/procurement/api/landed-costs";

export const GET = withErrorHandling(listLandedCosts);
export const POST = withErrorHandling(createLandedCost);
