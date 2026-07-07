import { withErrorHandling } from "@/lib/api/response";
import { loginHandler } from "@/modules/auth/api/login";

export const POST = withErrorHandling(loginHandler);
