import { withErrorHandling } from "@/lib/api/response";
import { inspectWarrantyClaim } from "@/modules/warranty/api/warranty-claims";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return inspectWarrantyClaim(id);
  }
);
