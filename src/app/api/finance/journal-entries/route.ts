import { withErrorHandling } from "@/lib/api/response";
import { listJournalEntries, createJournalEntry } from "@/modules/finance/api/journal-entries";

export const GET = withErrorHandling(listJournalEntries);
export const POST = withErrorHandling(createJournalEntry);
