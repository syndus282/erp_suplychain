import { withErrorHandling } from "@/lib/api/response";
import { listUsers } from "@/modules/auth/api/users";

export const GET = withErrorHandling(listUsers);
