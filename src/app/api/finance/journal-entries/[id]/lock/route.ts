import { withErrorHandling } from "@/lib/api/response";
import { lockJournalEntryAction } from "@/modules/finance/api/journal-entries";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    return lockJournalEntryAction(id);
  }
);
