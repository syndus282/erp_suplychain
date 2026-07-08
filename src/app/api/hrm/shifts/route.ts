import { withErrorHandling } from "@/lib/api/response";
import { shiftApi } from "@/modules/hrm/api/shifts";

export const GET = withErrorHandling(shiftApi.list);
export const POST = withErrorHandling(shiftApi.create);
