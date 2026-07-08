import { withErrorHandling } from "@/lib/api/response";
import { runEscalation } from "@/modules/workflow/api/escalation";

export const POST = withErrorHandling(runEscalation);
