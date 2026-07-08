import { withErrorHandling } from "@/lib/api/response";
import { listPayrolls } from "@/modules/hrm/api/payroll";

export const GET = withErrorHandling(listPayrolls);
