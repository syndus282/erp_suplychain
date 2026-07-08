import { withErrorHandling } from "@/lib/api/response";
import { getActiveAlerts } from "@/modules/bi/api/alerts";

export const GET = withErrorHandling(getActiveAlerts);
