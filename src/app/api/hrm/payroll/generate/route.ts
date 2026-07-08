import { withErrorHandling } from "@/lib/api/response";
import { generatePayroll } from "@/modules/hrm/api/payroll";

export const POST = withErrorHandling(generatePayroll);
