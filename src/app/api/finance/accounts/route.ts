import { withErrorHandling } from "@/lib/api/response";
import { accountApi } from "@/modules/finance/api/accounts";

export const GET = withErrorHandling(accountApi.list);
export const POST = withErrorHandling(accountApi.create);
