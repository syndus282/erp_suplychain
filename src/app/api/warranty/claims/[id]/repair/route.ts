import { withErrorHandling } from "@/lib/api/response";
import { repairWarrantyClaim } from "@/modules/warranty/api/warranty-claims";

export const POST = withErrorHandling(
  async (request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return repairWarrantyClaim(request, id);
  }
);
