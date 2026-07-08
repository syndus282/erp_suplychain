import { withErrorHandling } from "@/lib/api/response";
import { listEmploymentContracts, createEmploymentContract } from "@/modules/hrm/api/employment-contracts";

export const GET = withErrorHandling(listEmploymentContracts);
export const POST = withErrorHandling(createEmploymentContract);
