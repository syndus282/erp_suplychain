import { withErrorHandling } from "@/lib/api/response";
import { depreciateFixedAsset } from "@/modules/finance/api/fixed-assets";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return depreciateFixedAsset(id);
  }
);
