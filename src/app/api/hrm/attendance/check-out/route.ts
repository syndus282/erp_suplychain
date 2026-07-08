import { withErrorHandling } from "@/lib/api/response";
import { checkOut } from "@/modules/hrm/api/attendance";

export const POST = withErrorHandling(checkOut);
