import { withErrorHandling } from "@/lib/api/response";
import { consignmentAgreementsApi } from "@/modules/distribution/api/consignment-agreements";

export const GET = withErrorHandling(consignmentAgreementsApi.list);
export const POST = withErrorHandling(consignmentAgreementsApi.create);
