import { withErrorHandling } from "@/lib/api/response";
import { listConsignmentReconciliations, createConsignmentReconciliation } from "@/modules/distribution/api/consignment-reconciliations";

export const GET = withErrorHandling(listConsignmentReconciliations);
export const POST = withErrorHandling(createConsignmentReconciliation);
