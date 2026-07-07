# nfr.md — Non-Functional Requirements

> Tài liệu nền Phase 0. Áp dụng cho toàn bộ hệ thống, mọi phase phải tuân thủ khi thiết kế API/DB/UI. Bối cảnh: ERP nội bộ 1 doanh nghiệp (chưa multi-tenant thật sự), quy mô người dùng vừa (nhân viên nội bộ + đại lý truy cập hạn chế), không phải hệ thống public-facing quy mô lớn.

---

## 1. Hiệu năng (Performance)

| Hạng mục | Mục tiêu |
|---|---|
| Thời gian phản hồi API (đọc, danh sách có phân trang) | < 500ms ở p95 với DB dev (SQLite), < 300ms ở p95 với SQL Server production |
| Thời gian phản hồi API (ghi/giao dịch có validate nghiệp vụ) | < 1s ở p95 |
| Tải trang đầu (First Contentful Paint) | < 2s trên mạng văn phòng/4G |
| Số người dùng đồng thời (giai đoạn đầu) | 50–100 nhân viên nội bộ + đại lý dùng portal ký gửi |
| Truy vấn danh sách lớn (Product, Inventory, SalesOrder...) | Bắt buộc phân trang (xem `docs/api-contract.md`), KHÔNG trả toàn bộ bảng trong 1 lần gọi |
| Báo cáo/Dashboard (Phase 11) | Cho phép độ trễ tới vài giây hoặc dữ liệu near-real-time (không yêu cầu real-time tuyệt đối) |

Chỉ số trên chỉ áp dụng khi có thể đo được (dùng làm mục tiêu thiết kế, không phải cam kết SLA hợp đồng).

---

## 2. Khả năng mở rộng (Scalability)

- Schema đã có `companyId` trên mọi bảng chính → sẵn sàng multi-company mà không cần đổi schema, kích hoạt khi cần (xem `docs/data-model.md` mục 1).
- Kiến trúc module hóa theo `src/modules/<ten-module>/` (CLAUDE.md mục 5) để có thể tách microservice sau này nếu cần, nhưng Phase 0-12 vẫn triển khai dạng monolith Next.js.
- Index bắt buộc trên mọi cột dùng để lọc/join thường xuyên: `companyId`, các cột khóa ngoại, các cột `code`/`status` dùng trong filter danh sách.
- DB dev SQLite chỉ phục vụ phát triển — không dùng để đánh giá hiệu năng production. Trước khi go-live phải migrate sang SQL Server và test lại hiệu năng.

---

## 3. Bảo mật (Security)

- **Xác thực**: session-based hoặc JWT (quyết định cụ thể ở Phase 1 khi dựng Auth), mật khẩu hash bằng `bcrypt`/`argon2` — KHÔNG lưu plaintext (field `User.passwordHash` đã phản ánh điều này).
- **Phân quyền**: RBAC theo `Role`/`Permission`/`UserRole`/`RolePermission` (đã có trong schema). Kiểm tra quyền ở tầng API (middleware/route handler), không chỉ ẩn ở UI.
- **Session control**: timeout sau X phút không hoạt động (mặc định đề xuất 30 phút, cấu hình được), giới hạn số phiên đăng nhập đồng thời — triển khai chi tiết ở Phase 1.
- **Password policy**: tối thiểu 8 ký tự, bắt buộc chữ hoa/thường/số — cấu hình được, không hard-code.
- **Dữ liệu nhạy cảm**: mã số thuế, thông tin liên hệ khách hàng/nhà cung cấp không log ra console/log file ở dạng plaintext trong môi trường production.
- **Audit Trail**: mọi hành động tạo/sửa/xóa/duyệt trên dữ liệu nghiệp vụ quan trọng phải ghi vào `AuditLog` (đã có trong schema Workflow) — bắt buộc từ Phase 10, khuyến khích áp dụng sớm hơn cho các bảng tài chính/tồn kho.
- **Giao thức**: bắt buộc HTTPS ở mọi môi trường trừ local dev.
- **Injection/OWASP Top 10**: dùng Prisma (tham số hóa query tự động, chống SQL injection); validate input ở boundary (API layer) bằng schema validation (vd. zod) — chốt cụ thể ở `docs/api-contract.md`.
- **Least privilege dữ liệu**: nhân viên Sales không xem được giá vốn, nhân viên Kho không sửa được giá bán (theo `docs/business-spec/13` mục 21) — thực hiện qua Permission, kiểm tra ở tầng API.

---

## 4. Tính sẵn sàng & Sao lưu (Availability & Backup)

- Giờ hoạt động chính: giờ hành chính (8h-18h các ngày làm việc) — không yêu cầu 24/7 uptime ở giai đoạn đầu, nhưng thiết kế không có lý do kỹ thuật nào chặn 24/7 sau này.
- **Backup**: sao lưu DB production (SQL Server) tối thiểu hàng ngày (daily full backup), giữ tối thiểu 30 ngày gần nhất. Chi tiết lịch/cơ chế backup cụ thể chốt khi hạ tầng production được xác định (ngoài phạm vi Phase 0).
- **RPO** (Recovery Point Objective) mục tiêu: ≤ 24h dữ liệu mất tối đa khi có sự cố.
- **RTO** (Recovery Time Objective) mục tiêu: ≤ 4h để khôi phục hệ thống hoạt động lại sau sự cố nghiêm trọng.
- Môi trường dev (SQLite `prisma/dev.db`) KHÔNG cần backup — dữ liệu dev có thể tái tạo bằng seed script.

---

## 5. Toàn vẹn dữ liệu (Data Integrity)

- Không âm kho: `InventoryBalance.onHandQty >= 0` — kiểm tra ở tầng ứng dụng trước khi ghi nhận `StockMovement` loại `ISSUE`/`TRANSFER_OUT` (xem `docs/data-model.md` mục 8).
- Bút toán kế toán cân đối: `SUM(debit) = SUM(credit)` trong mỗi `JournalEntry` (Phase 8) — validate bắt buộc trước khi lưu.
- Không sửa/xóa chứng từ đã khóa sổ (`JournalEntry.status = LOCKED`) hoặc đã phát sinh giao dịch liên quan (Product đã bán, PO đã nhận hàng...) — theo `docs/business-spec/13` mục 30.
- Ràng buộc khóa ngoại thực thi qua Prisma/DB — không tự ý tắt (`onDelete: Cascade` chỉ dùng khi rõ ràng là quan hệ sở hữu 1-nhiều thật sự, mặc định dùng `Restrict` ngầm định của Prisma để tránh xóa nhầm dữ liệu tham chiếu).

---

## 6. Khả năng quan sát (Observability)

- Log lỗi tầng ứng dụng (API route) — tối thiểu: timestamp, request path, user/company, mã lỗi, message (không log toàn bộ payload nếu chứa dữ liệu nhạy cảm).
- `AuditLog` (Workflow module) phục vụ truy vết nghiệp vụ (ai sửa gì, khi nào) — khác mục đích với log lỗi hệ thống.
- Theo dõi cảnh báo nghiệp vụ (tồn kho thấp, công nợ quá hạn, PO trễ...) đã liệt kê ở `docs/business-spec/01` mục 12 — triển khai cụ thể ở Phase 11 (BI Dashboard), Phase 0 chỉ đảm bảo dữ liệu nguồn đã đủ trong schema.
- Công cụ giám sát/APM cụ thể (Sentry, Datadog...) — quyết định khi có hạ tầng production, không chốt ở Phase 0.

---

## 7. Khả năng di chuyển dữ liệu (Portability / Migration)

- Toàn bộ code business logic KHÔNG được phụ thuộc vào tính năng đặc thù của SQLite (vd. không dùng raw SQL SQLite-only) — mọi truy vấn qua Prisma Client để đảm bảo đổi `provider` sang `sqlserver` trong `schema.prisma` là đủ để migrate (theo CLAUDE.md mục 3).
- Trước khi go-live: chạy lại toàn bộ test suite trên SQL Server (không chỉ SQLite) để phát hiện khác biệt hành vi (vd. collation, case-sensitivity của so sánh string).

---

## 8. Đa ngôn ngữ & Bản địa hóa (i18n)

- Ngôn ngữ chính: Tiếng Việt (UI, thông báo lỗi cho người dùng cuối).
- Tên field/model trong code: tiếng Anh (đã áp dụng trong `prisma/schema.prisma`).
- Định dạng ngày giờ hiển thị: `dd/MM/yyyy`, lưu trữ UTC `DateTime` (CLAUDE.md mục 4).
- Định dạng số/tiền tệ hiển thị: phân tách hàng nghìn kiểu Việt Nam (`1.500.000 ₫`), quy đổi từ Int lưu trữ theo `docs/currency-handling.md`.
- Hỗ trợ đa ngôn ngữ đầy đủ (English UI) không thuộc phạm vi hiện tại — để ngỏ khả năng thêm sau (không thiết kế cấu trúc chặn việc này).

---

## 9. Khả năng tương thích (Compatibility)

- Trình duyệt hỗ trợ: 2 phiên bản gần nhất của Chrome, Edge, Firefox, Safari (desktop). Không cam kết hỗ trợ Internet Explorer.
- Responsive: ưu tiên desktop (nhân viên văn phòng/kho dùng máy tính), hỗ trợ tablet ở mức xem được (không bắt buộc tối ưu mobile-first cho giai đoạn đầu, trừ tính năng dành riêng cho tài xế/kỹ thuật viên hiện trường — cân nhắc PWA/mobile ở Phase 6-7 khi triển khai).

---

## 10. Tuân thủ (Compliance)

- Tuân thủ nguyên tắc kế toán Việt Nam (VAS) cho phân hệ Finance (Phase 8): hệ thống tài khoản kế toán, nguyên tắc double-entry, chênh lệch tỷ giá theo TT200/VAS 10.
- Lưu trữ chứng từ kế toán tối thiểu theo quy định pháp luật hiện hành (thường 10 năm với chứng từ kế toán) — ảnh hưởng tới chính sách retention dữ liệu, không xóa cứng dữ liệu tài chính (dùng `status` thay vì xóa, xem mục 5).
- Hóa đơn điện tử/tích hợp cơ quan thuế: đã gác lại theo `docs/ROADMAP.md` mục 5-9, không thuộc phạm vi hiện tại.

---

## 11. Chưa chốt / để lại khi có hạ tầng thật

- Hạ tầng hosting cụ thể (on-premise/cloud, nhà cung cấp) — ảnh hưởng tới backup/DR chi tiết.
- Công cụ APM/monitoring cụ thể.
- SLA hợp đồng chính thức với người dùng nội bộ (các con số ở mục 1 là mục tiêu kỹ thuật, không phải cam kết pháp lý).
