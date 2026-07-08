import { SalesOrderDetailClient } from "@/modules/sales/components/SalesOrderDetailClient";

export default async function SalesOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SalesOrderDetailClient soId={id} />;
}
