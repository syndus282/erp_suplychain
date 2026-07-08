import { withErrorHandling } from "@/lib/api/response";
import { markAllNotificationsRead } from "@/modules/workflow/api/notifications";

export const POST = withErrorHandling(markAllNotificationsRead);
