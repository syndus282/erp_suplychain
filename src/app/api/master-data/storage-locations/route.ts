import { withErrorHandling } from "@/lib/api/response";
import { listStorageLocations, createStorageLocation } from "@/modules/master-data/api/storage-locations";

export const GET = withErrorHandling(listStorageLocations);
export const POST = withErrorHandling(createStorageLocation);
