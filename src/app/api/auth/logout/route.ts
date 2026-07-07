import { withErrorHandling } from "@/lib/api/response";
import { logoutHandler } from "@/modules/auth/api/logout";

export const POST = withErrorHandling(logoutHandler);
