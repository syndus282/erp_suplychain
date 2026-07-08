import { withErrorHandling } from "@/lib/api/response";
import { listCommissionRecords, createCommissionRecord } from "@/modules/hrm/api/commission-records";

export const GET = withErrorHandling(listCommissionRecords);
export const POST = withErrorHandling(createCommissionRecord);
