import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api/response";
import { getDefaultCompanyId } from "../lib/company";

/**
 * Danh mục sản phẩm công khai cho kênh bán online (docs/ROADMAP.md mục 1.4:
 * "Website đầy đủ làm ở Phase cuối"). KHÔNG cần session — chỉ trả field an
 * toàn để hiển thị công khai (không có giá vốn/tồn kho nội bộ). Giá bán lấy
 * từ bảng giá loại SALE đầu tiên tìm thấy (đơn giản hóa: hệ thống hiện chưa
 * có khái niệm "bảng giá mặc định cho khách online" riêng — sản phẩm không
 * có giá trong bảng SALE sẽ không hiển thị giá, để nhân viên tự báo giá khi
 * xử lý đơn).
 */
export async function listPublicProducts() {
  const companyId = await getDefaultCompanyId();

  const priceList = await prisma.priceList.findFirst({
    where: { companyId, type: "SALE" },
    orderBy: { createdAt: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { companyId, status: "ACTIVE" },
    select: { id: true, code: true, name: true, tradeName: true, brand: true },
    orderBy: { name: "asc" },
    take: 200,
  });

  let priceByProduct = new Map<string, number>();
  if (priceList) {
    const items = await prisma.priceListItem.findMany({
      where: { priceListId: priceList.id },
      select: { productId: true, unitPrice: true },
    });
    priceByProduct = new Map(items.map((i) => [i.productId, i.unitPrice]));
  }

  return apiSuccess(
    products.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      tradeName: p.tradeName,
      brand: p.brand,
      unitPrice: priceByProduct.get(p.id) ?? null,
      currency: priceList?.currency ?? "VND",
    }))
  );
}
