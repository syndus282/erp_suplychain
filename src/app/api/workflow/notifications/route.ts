import { withErrorHandling } from "@/lib/api/response";
import { listNotifications } from "@/modules/workflow/api/notifications";

export const GET = withErrorHandling(listNotifications);
