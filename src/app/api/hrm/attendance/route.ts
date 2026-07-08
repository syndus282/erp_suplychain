import { withErrorHandling } from "@/lib/api/response";
import { listAttendance } from "@/modules/hrm/api/attendance";

export const GET = withErrorHandling(listAttendance);
