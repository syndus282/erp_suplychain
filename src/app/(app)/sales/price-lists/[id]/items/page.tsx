import { PriceListItemsClient } from "@/modules/sales/components/PriceListItemsClient";

export default async function PriceListItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PriceListItemsClient priceListId={id} />;
}
