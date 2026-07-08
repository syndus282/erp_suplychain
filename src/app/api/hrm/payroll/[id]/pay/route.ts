import { withErrorHandling } from "@/lib/api/response";
import { payPayroll } from "@/modules/hrm/api/payroll";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return payPayroll(id);
  }
);
