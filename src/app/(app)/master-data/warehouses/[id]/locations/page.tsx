import { LocationsClient } from "./LocationsClient";

export default async function WarehouseLocationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationsClient warehouseId={id} />;
}
