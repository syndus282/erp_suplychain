import { withErrorHandling } from "@/lib/api/response";
import { receiveCoreReturn } from "@/modules/warranty/api/core-returns";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return receiveCoreReturn(id);
  }
);
