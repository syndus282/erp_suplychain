import { prisma } from "@/lib/prisma";
import { notFoundError } from "@/lib/api/errors";

/**
 * Endpoint public (kênh online, không có session) cần companyId nhưng không
 * có gì để tra — hệ thống hiện chỉ multi-company SẴN SÀNG chứ CHƯA kích hoạt
 * (docs/ROADMAP.md mục 2: "companyId trên mọi bảng nhưng chưa kích hoạt multi-
 * company"), nên lấy company duy nhất hiện có. Khi nào thật sự bật multi-
 * company, endpoint public phải đổi sang nhận companyId/subdomain từ URL.
 */
export async function getDefaultCompanyId(): Promise<string> {
  const company = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  if (!company) throw notFoundError("Hệ thống chưa được khởi tạo (chưa có Company)");
  return company.id;
}
