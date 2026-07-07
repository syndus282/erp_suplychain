import { withErrorHandling } from "@/lib/api/response";
import { departmentsApi } from "@/modules/organization/api/departments";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return departmentsApi.update(request, id);
  }
);
