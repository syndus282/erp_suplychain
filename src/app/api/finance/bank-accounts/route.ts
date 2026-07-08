import { withErrorHandling } from "@/lib/api/response";
import { bankAccountApi } from "@/modules/finance/api/bank-accounts";

export const GET = withErrorHandling(bankAccountApi.list);
export const POST = withErrorHandling(bankAccountApi.create);
