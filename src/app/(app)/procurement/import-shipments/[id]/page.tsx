import { LandedCostClient } from "@/modules/procurement/components/LandedCostClient";

export default async function ImportShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LandedCostClient shipmentId={id} />;
}
