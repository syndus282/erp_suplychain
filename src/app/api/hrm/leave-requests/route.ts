import { withErrorHandling } from "@/lib/api/response";
import { listLeaveRequests, createLeaveRequest } from "@/modules/hrm/api/leave-requests";

export const GET = withErrorHandling(listLeaveRequests);
export const POST = withErrorHandling(createLeaveRequest);
