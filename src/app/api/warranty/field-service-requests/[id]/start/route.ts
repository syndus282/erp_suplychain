import { withErrorHandling } from "@/lib/api/response";
import { startFieldServiceRequest } from "@/modules/warranty/api/field-service-requests";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return startFieldServiceRequest(id);
  }
);
