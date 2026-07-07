import { withErrorHandling } from "@/lib/api/response";
import { employeesApi } from "@/modules/organization/api/employees";

export const PATCH = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return employeesApi.update(request, id);
  }
);
