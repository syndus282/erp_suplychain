import { withErrorHandling } from "@/lib/api/response";
import { meHandler } from "@/modules/auth/api/me";

export const GET = withErrorHandling(meHandler);
