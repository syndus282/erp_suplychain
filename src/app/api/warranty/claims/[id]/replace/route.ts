import { withErrorHandling } from "@/lib/api/response";
import { replaceWarrantyClaim } from "@/modules/warranty/api/warranty-claims";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return replaceWarrantyClaim(request, id);
  }
);
