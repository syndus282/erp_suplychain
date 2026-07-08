import { withErrorHandling } from "@/lib/api/response";
import { assignFieldServiceRequest } from "@/modules/warranty/api/field-service-requests";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return assignFieldServiceRequest(request, id);
  }
);
