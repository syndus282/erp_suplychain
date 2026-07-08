import { withErrorHandling } from "@/lib/api/response";
import { confirmPayroll } from "@/modules/hrm/api/payroll";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return confirmPayroll(id);
  }
);
