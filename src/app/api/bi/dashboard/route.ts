import { withErrorHandling } from "@/lib/api/response";
import { getExecutiveDashboard } from "@/modules/bi/api/dashboard";

export const GET = withErrorHandling(getExecutiveDashboard);
