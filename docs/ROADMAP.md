# ROADMAP.md — Kế hoạch triển khai chi tiết

> File này KHÔNG được auto-load mỗi session (không phải CLAUDE.md). Chỉ đọc khi cần biết chi tiết 1 phase cụ thể. Trạng thái tổng thể xem ở `TASKS.md`, không phải file này.

---

# 1. PHẠM VI ĐÃ CHỐT

| # | Nội dung | Quyết định |
|---|---|---|
| 1 | Sản xuất/lắp ráp/BOM | Không cần |
| 2 | Hải quan | Không quản lý chi tiết. Đơn vị nhập khẩu ủy thác xử lý hải quan + đơn vị vận chuyển nhận hàng qua cửa khẩu, chở về kho công ty. Chỉ theo dõi mốc bàn giao. |
| 3 | Ngoại tệ & tỷ giá | Bắt buộc có — xem mục 3 |
| 4 | Bán hàng online | Giai đoạn đầu: field `salesChannel = ONLINE/OFFLINE` trên Sales Order. Website đầy đủ làm ở Phase cuối. |
| 5-9 | Bảo hiểm hàng hóa, RTV quốc tế, forecast AI, hóa đơn điện tử/hải quan/ngân hàng, loyalty | Gác lại |
| 10 | Contract Management tổng thể | Có, ưu tiên thấp nhất — Phase cuối |

---

# 2. TECH STACK & QUY ƯỚC KỸ THUẬT

Xem chi tiết đầy đủ trong `CLAUDE.md` mục 3-4. Tóm tắt:

- Next.js + TypeScript + Prisma + Tailwind
- Dev: SQLite → Prod (sau): SQL Server — chuyển bằng cách đổi `provider` trong `schema.prisma`
- Tiền tệ = Int (đơn vị nhỏ nhất), không Float/Decimal
- Khóa chính = cuid string, không auto-increment
- Mọi bảng chính có `companyId` (multi-company sẵn sàng nhưng chưa kích hoạt)

## 2.1 Quản lý Ngoại tệ & Tỷ giá (module xuyên suốt, không phải 1 phase riêng)

Áp dụng trong: Purchase Order, Import Shipment, Supplier Invoice, Payment, FX Revaluation cuối kỳ.

Yêu cầu:
- Field `currency` (VND/USD/...) đi kèm mọi field tiền tệ
- Field `exchangeRate` tại thời điểm ghi nhận giao dịch
- Bút toán chênh lệch tỷ giá (FX Gain/Loss) tự động khi thanh toán khác thời điểm ghi nhận
- Đánh giá lại số dư ngoại tệ cuối kỳ (chỉ cần làm ở Phase 8 - Finance, nhưng field phải có sẵn từ Phase 2)

---

# 3. THỨ TỰ BUILD (PHASES)

Trạng thái chi tiết theo dõi tại `TASKS.md`. Danh sách dưới đây là nội dung/phạm vi từng phase.

## Phase 0 — Tài liệu kỹ thuật nền (không code)
- `docs/data-model.md` (ERD) — TRƯỚC TIÊN, mọi phase sau phụ thuộc vào đây
- `docs/currency-handling.md`
- `docs/nfr.md`
- `docs/api-contract.md`
- `docs/design-system.md` (Liquid Glass)
- Sau khi có ERD → khởi tạo `prisma/schema.prisma` khung ban đầu + seed 1 company mặc định

## Phase 1 — Foundation
- Auth/User/Role/Permission
- Master Data lõi: Product, Vehicle Compatibility, UOM, Warehouse, Location
- Organization Structure (company/branch/department)
- Khung Workflow tối giản: request → 1 người duyệt (chưa cần escalation/notification)

## Phase 2 — Procurement & Entrusted Import
- Nguồn: `docs/business-spec/02-procurement-entrusted-import.md`, `docs/business-spec/10-procurement-import-consignment.md`
- Purchase Request → Purchase Order (đa tiền tệ, áp dụng mục 2.1)
- Theo dõi lô hàng nhập khẩu ủy thác (đơn giản hoá, không có bước hải quan chi tiết)
- Landed Cost Calculation
- Supplier Master

## Phase 3 — Inventory & Warehouse
- Nguồn: `docs/business-spec/03-inventory-warehouse.md`
- Nhập/xuất/điều chuyển/kiểm kê, Serial/Lot, hàng đang vận chuyển

## Phase 4 — Distribution & Consignment/Dealer
- Nguồn: `docs/business-spec/04-distribution-dealer.md`, `docs/business-spec/14-consignment-inventory.md`
- Dealer Master, phân cấp đại lý, ký gửi, đối soát, thu hồi, credit cơ bản

## Phase 5 — Sales Order & Customer
- Nguồn: `docs/business-spec/05-sales-order-customer.md`
- Customer Master, Quotation → Sales Order, field `salesChannel`, Pricing/Discount/Credit Check

## Phase 6 — Logistics & Delivery
- Nguồn: `docs/business-spec/06-logistics-delivery.md`
- Delivery Request/Planning/Shipment, POD, quản lý xe/tài xế (tối giản)

## Phase 7 — Warranty, RMA & Field Service
- Nguồn: `docs/business-spec/07-warranty-rma-field-service.md`
- Warranty Registration/Claim, Core Return, Field Service/Installation (tối giản)

## Phase 8 — Finance & Accounting
- Nguồn: `docs/business-spec/08-finance-accounting.md`
- GL, AP, AR, Inventory Accounting, FX Revaluation cuối kỳ, Fixed Asset/Budget (tối giản)

## Phase 9 — HRM, Attendance & Payroll
- Nguồn: `docs/business-spec/09-hrm-attendance-payroll.md`
- Employee Master, chấm công, lương cơ bản, Commission liên kết Sales/Logistics

## Phase 10 — Workflow/Approval hoàn chỉnh
- Nguồn: `docs/business-spec/12-workflow-approval.md`
- Approval Matrix đầy đủ theo giá trị giao dịch, Notification/Escalation, Audit Trail

## Phase 11 — Business Intelligence & Dashboard
- Nguồn: `docs/business-spec/11-business-intelligence.md`
- Dashboard tổng hợp, Alert Management

## Phase 12 — Ưu tiên thấp (sau cùng)
- Contract Management tổng thể
- Website bán hàng online đầy đủ

---

# 4. QUY TẮC ĐẶT TÊN SESSION/BRANCH KHI DÙNG CLAUDE CODE

- 1 branch git = 1 module trong 1 phase, ví dụ: `feature/p2-purchase-order`
- Không code 2 phase cùng lúc trong 1 branch/session
- Trước khi mở PR/merge: chạy type-check + test, cập nhật `TASKS.md`
