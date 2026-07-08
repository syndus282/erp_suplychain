import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api/response";
import { businessRuleError, validationError } from "@/lib/api/errors";
import { generateCode } from "@/modules/procurement/lib/codegen";
import { getDefaultCompanyId } from "../lib/company";

const lineSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().positive(),
});

const createSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Giỏ hàng đang trống"),
});

/**
 * Đặt hàng online KHÔNG cần đăng nhập (kênh online, docs/ROADMAP.md mục
 * 1.4). Đơn tạo ra ở trạng thái DRAFT, `salesChannel=ONLINE` — nhân viên bán
 * hàng xử lý tiếp (xác nhận/xuất kho) qua đúng màn hình Đơn hàng bán nội bộ
 * hiện có (Phase 5), KHÔNG có luồng nghiệp vụ riêng cho online (tránh viết
 * lại 2 lần logic xác nhận đơn/giữ hàng/kiểm tra hạn mức tín dụng). Vì
 * không có session nên KHÔNG check hạn mức tín dụng ở bước tạo — giống hệt
 * hành vi `createSalesOrder` nội bộ (chỉ check ở bước confirm).
 */
export async function createOnlineOrder(request: Request) {
  const companyId = await getDefaultCompanyId();
  const input = createSchema.parse(await request.json());

  const priceList = await prisma.priceList.findFirst({
    where: { companyId, type: "SALE" },
    orderBy: { createdAt: "asc" },
  });
  if (!priceList) {
    throw businessRuleError("Cửa hàng chưa cấu hình bảng giá bán, vui lòng liên hệ trực tiếp để được báo giá", {
      rule: "NO_SALE_PRICE_LIST",
    });
  }

  const priceItems = await prisma.priceListItem.findMany({
    where: { priceListId: priceList.id, productId: { in: input.lines.map((l) => l.productId) } },
  });
  const priceByProduct = new Map(priceItems.map((i) => [i.productId, i.unitPrice]));
  for (const line of input.lines) {
    if (!priceByProduct.has(line.productId)) {
      throw validationError("Có sản phẩm trong giỏ hàng chưa được niêm yết giá — vui lòng bỏ khỏi giỏ hàng và thử lại");
    }
  }

  let customer = await prisma.customer.findFirst({ where: { companyId, phone: input.phone } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        companyId,
        code: generateCode("CUS-ONLINE"),
        name: input.customerName,
        type: "RETAIL",
        phone: input.phone,
        email: input.email || undefined,
        address: input.address,
      },
    });
  }

  const order = await prisma.salesOrder.create({
    data: {
      companyId,
      code: generateCode("SO-ONLINE"),
      customerId: customer.id,
      salesChannel: "ONLINE",
      deliveryAddress: input.address,
      status: "DRAFT",
      lines: {
        create: input.lines.map((line) => {
          const unitPrice = priceByProduct.get(line.productId)!;
          return {
            productId: line.productId,
            qty: line.qty,
            unitPrice,
            discount: 0,
            tax: 0,
            totalAmount: Math.round(unitPrice * line.qty),
          };
        }),
      },
    },
    include: { lines: { include: { product: true } } },
  });

  return apiSuccess({ code: order.code, id: order.id }, undefined, 201);
}
