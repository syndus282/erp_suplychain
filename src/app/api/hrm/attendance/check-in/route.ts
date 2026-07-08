import { withErrorHandling } from "@/lib/api/response";
import { checkIn } from "@/modules/hrm/api/attendance";

export const POST = withErrorHandling(checkIn);
