import { ShipmentDetailClient } from "@/modules/logistics/components/ShipmentDetailClient";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShipmentDetailClient shipmentId={id} />;
}
