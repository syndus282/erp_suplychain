# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | ✅ Hoàn thành | |
| 1 | Foundation (Auth, Master Data, Org, Workflow tối giản) | ✅ Hoàn thành | Branch `claude/phase-1-foundation` |
| 2 | Procurement & Entrusted Import | ✅ Hoàn thành | Branch `claude/phase-2-procurement` (kế thừa Phase 1) |
| 3 | Inventory & Warehouse | ⬜ | Sẽ làm trên branch riêng kế thừa Phase 2 |
| 4 | Distribution & Consignment | ⬜ | Sẽ làm trên branch riêng kế thừa Phase 3 |
| 5 | Sales Order & Customer | ⬜ | |
| 6 | Logistics & Delivery | ⬜ | |
| 7 | Warranty/RMA/Field Service | ⬜ | |
| 8 | Finance & Accounting | ⬜ | |
| 9 | HRM & Payroll | ⬜ | |
| 10 | Workflow/Approval hoàn chỉnh | ⬜ | |
| 11 | BI Dashboard | ⬜ | |
| 12 | Contract Management + Online Channel | ⬜ | |

Ký hiệu: ⬜ Chưa bắt đầu · 🔶 Đang làm dở · ✅ Hoàn thành · ⚠️ Có lỗi cần fix

---

## Việc đang dở (nếu có) — session tiếp theo đọc phần này TRƯỚC TIÊN

```
Phase 0: HOÀN THÀNH. Phase 1 (Foundation — Next.js/Tailwind, Auth JWT, Master
Data CRUD, Organization CRUD, Workflow tối giản, UI "Liquid Glass", hạ tầng
API dùng chung): HOÀN THÀNH trên branch `claude/phase-1-foundation`. Chi tiết
xem git log của branch đó — không lặp lại ở đây nữa.

Phase 2 - Procurement & Entrusted Import: HOÀN THÀNH trên branch
`claude/phase-2-procurement` (kế thừa từ Phase 1).

Đã xong:
- Supplier Master CRUD (API + UI) — dùng chung crud-factory.
- Purchase Request (PR) + PR Line: tạo PR gắn kèm chọn người duyệt
  (approverUserId) → GỌI THẬT `createApprovalRequest` (workflow tối giản từ
  Phase 1) trong cùng 1 transaction. Đây là lần đầu tiên khung workflow được
  1 module nghiệp vụ sử dụng thật.
- Cơ chế đồng bộ trạng thái sau khi duyệt: `src/modules/workflow/lib/
  entity-sync.ts` — sau khi `decideApprovalStep` xong, tự động cập nhật
  `PurchaseRequest.status` theo quyết định (APPROVED/REJECTED). Cách làm là
  switch cứng theo entityType (chỉ gọi thẳng Prisma model, KHÔNG import chéo
  module) — chấp nhận được vì mới có 1 entity tích hợp; nếu Phase 3+ có thêm
  nhiều entity tích hợp workflow, cân nhắc refactor sang handler-registry.
- Purchase Order (PO) + PO Line: chỉ tạo được từ PR có status APPROVED (đúng
  quy tắc "Không cho tạo PO nếu PR chưa duyệt" — docs/business-spec/02), tự
  chuyển PR sang CONVERTED sau khi tạo PO (chặn dùng lại PR đã convert). Đa
  tiền tệ (currency/exchangeRate) theo docs/currency-handling.md. Action
  riêng `POST /:id/approve` (permission `purchase-order:approve`) chuyển
  DRAFT → APPROVED — CHƯA dùng lại khung ApprovalRequest đa bước cho PO (để
  đơn giản; ApprovalMatrix đầy đủ theo ngưỡng giá trị thuộc Phase 10).
- Import Shipment + Import Shipment Document (list/create/update), theo dõi
  ETA/ETD/trạng thái — đơn giản hóa, chưa có bước hải quan chi tiết (đúng
  scope ROADMAP).
- Landed Cost + Landed Cost Allocation: ghi nhận nhiều khoản chi phí/lô hàng,
  action `POST /landed-costs/:shipmentId/allocate` phân bổ vào từng PO Line
  theo BY_VALUE hoặc BY_QTY (làm tròn kiểu "largest remainder" — dòng cuối
  nhận phần dư để tổng phân bổ luôn khớp chính xác số tiền gốc, theo
  docs/currency-handling.md mục 5). BY_WEIGHT/BY_VOLUME trả lỗi rõ ràng
  "chưa hỗ trợ" vì Product chưa có field trọng lượng/thể tích trong ERD.
- Goods Receipt + Goods Receipt Line + Receipt Discrepancy: nhận hàng theo
  PO, chặn nhận vượt số lượng còn lại (qtyRemaining) bằng business rule rõ
  ràng, tự cập nhật PurchaseOrderLine.qtyReceived/qtyRemaining và
  PurchaseOrder.status (PARTIALLY_RECEIVED/CLOSED) trong 1 transaction. CỐ Ý
  CHƯA đụng tới InventoryBalance/StockMovement/SerialNumber — việc đó thuộc
  Phase 3 (Inventory & Warehouse), Phase 3 sẽ mở rộng GoodsReceipt để phát
  sinh StockMovement khi có schema Inventory đầy đủ.
- Thêm resource "user" (chỉ action `read`) để chọn người duyệt trong form —
  `GET /api/org/users`.
- Đã kiểm thử THẬT toàn bộ luồng qua curl: tạo Supplier → tạo PR → duyệt qua
  `/api/workflow/approval-requests/:id/decide` → PR tự chuyển APPROVED → tạo
  PO từ PR (chặn nếu dùng PR chưa duyệt hoặc đã CONVERTED) → duyệt PO → tạo
  Import Shipment → thêm Landed Cost (2 phương pháp) → phân bổ → tạo Goods
  Receipt (nhận thiếu → PARTIALLY_RECEIVED, chặn nhận vượt, nhận đủ →
  CLOSED). Playwright chụp màn hình xác nhận UI render đúng. `npm run
  build`/`type-check`/`lint` đều sạch.
- Sửa 1 bug phát hiện khi test: `z.string().optional()` cho field ngày (input
  type="date" chỉ gửi "YYYY-MM-DD") làm Prisma báo lỗi "premature end of
  input. Expected ISO-8601 DateTime" — thêm helper dùng chung
  `src/lib/api/validation.ts#optionalDateInput()` (transform sang Date, ""
  → undefined), áp dụng cho mọi field ngày optional từ form (PR.neededDate,
  PO.expectedDeliveryDate, ImportShipment.eta/etd/actualArrivalDate,
  Employee.hireDate).

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 2):
- InventoryBalance/StockMovement/SerialNumber chưa được tạo khi nhận hàng —
  Phase 3 sẽ nối vào GoodsReceipt.
- ApprovalMatrix đa cấp cho PO theo ngưỡng giá trị — Phase 10.
- Kiểm tra ngân sách ("không vượt ngân sách phê duyệt" — docs/business-spec/02)
  chưa triển khai vì cần Budget module (Phase 8).
- Carrier Master (nhà vận chuyển) chưa có CRUD/UI — field `carrierId` trên
  ImportShipment vẫn tồn tại trong schema nhưng chưa dùng ở Phase 2; đầy đủ ở
  Phase 6 (Logistics).
- QC Inspection chi tiết (biên bản, hình ảnh...) — GoodsReceiptLine mới có
  field `qcResult` đơn giản (PASS/REJECT/CONDITIONAL_PASS), chưa có luồng
  riêng.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/procurement/**, src/modules/workflow/lib/
entity-sync.ts, src/lib/api/validation.ts, src/app/api/procurement/**,
src/app/(app)/procurement/**, prisma/seed.ts (thêm resource supplier/
purchase-request/purchase-order/import-shipment/landed-cost/goods-receipt/user).

---

Phase 3 - Inventory & Warehouse: BẮT ĐẦU TIẾP THEO, trên branch riêng kế thừa
từ claude/phase-2-procurement.
```

---

## Quyết định kỹ thuật quan trọng đã chốt (không tự ý đổi)

- Tiền tệ lưu Int, không Decimal/Float (lý do: SQLite → SQL Server migrate an toàn)
- Khóa chính dùng cuid string
- Mọi bảng chính có companyId
- Prisma pin ở bản 6.x (không dùng 7.x) — Prisma 7 đổi cách khai báo datasource
  (bỏ `url` trong schema.prisma, chuyển sang prisma.config.ts), không tương thích
  với quy ước `url = env("DATABASE_URL")` phổ biến đang dùng. Không tự ý nâng lên 7.x.
- Đại lý (Dealer) mô hình hóa = Customer (type=DEALER) + DealerProfile 1-1,
  KHÔNG tách bảng Dealer riêng — xem lý do ở docs/data-model.md mục 16.
- Approval/Audit dùng entityType+entityId (không FK cứng tới từng bảng nghiệp vụ)
  — xem lý do ở docs/data-model.md mục 16.
- Seed config dùng `package.json#prisma.seed` (cách cũ, Prisma in warning
  "deprecated, sẽ bỏ ở Prisma 7") — CHẤP NHẬN ĐƯỢC vì đã pin Prisma 6.x có chủ
  đích (xem trên). Không cần sửa sang `prisma.config.ts` trừ khi quyết định
  nâng lên Prisma 7 (hiện chưa có kế hoạch này).
- Next.js pin ở bản 15.5.20 (không dùng 16.x) — lý do kỹ thuật ghi ở "Việc đang dở" Phase 1. Không tự ý nâng lên 16.x.
- Auth tự viết (JWT `jose` + cookie httpOnly), KHÔNG dùng NextAuth — vì schema User/Role/Permission đã tự thiết kế sẵn từ Phase 0, NextAuth adapter model không khớp trực tiếp, tự viết đơn giản hơn cho quy mô hiện tại.
- Route Next.js (`src/app/**`) chỉ là wrapper mỏng — logic thật nằm ở `src/modules/<module>/api/*.ts` theo đúng cấu trúc CLAUDE.md mục 5. Route handler CHỈ decode params + gọi hàm module + bọc `withErrorHandling`.
- CRUD đơn giản (không quan hệ nhiều-nhiều) dùng chung `src/lib/api/crud-factory.ts`; resource có quan hệ phức tạp (Product, StorageLocation) viết handler riêng — không ép vào factory.
- Field ngày optional nhận từ form PHẢI dùng `src/lib/api/validation.ts#optionalDateInput()`, KHÔNG dùng `z.string().optional()` trực tiếp — Prisma không tự parse chuỗi ngày rút gọn "YYYY-MM-DD" (chỉ nhận Date object hoặc ISO-8601 đầy đủ).
- Đồng bộ trạng thái entity sau khi workflow duyệt/từ chối dùng switch cứng tại `src/modules/workflow/lib/entity-sync.ts` (gọi thẳng Prisma model, không import chéo module). Khi có nhiều entity tích hợp hơn (>3-4), refactor sang handler-registry thay vì thêm case mãi vào switch này.
- PO approve là action permission-gated đơn giản (`purchase-order:approve`), KHÔNG dùng lại ApprovalRequest đa bước — ApprovalMatrix đầy đủ để dành Phase 10.
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
