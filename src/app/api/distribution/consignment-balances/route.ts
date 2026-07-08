import { withErrorHandling } from "@/lib/api/response";
import { listConsignmentBalances } from "@/modules/distribution/api/consignment-balances";

export const GET = withErrorHandling(listConsignmentBalances);
