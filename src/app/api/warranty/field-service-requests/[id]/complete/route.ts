import { withErrorHandling } from "@/lib/api/response";
import { completeFieldServiceRequest } from "@/modules/warranty/api/field-service-requests";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return completeFieldServiceRequest(id);
  }
);
