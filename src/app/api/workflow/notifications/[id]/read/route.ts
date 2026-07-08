import { withErrorHandling } from "@/lib/api/response";
import { markNotificationRead } from "@/modules/workflow/api/notifications";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return markNotificationRead(id);
  }
);
