# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | ✅ Hoàn thành | |
| 1 | Foundation (Auth, Master Data, Org, Workflow tối giản) | ✅ Hoàn thành | Branch `claude/phase-1-foundation` |
| 2 | Procurement & Entrusted Import | ✅ Hoàn thành | Branch `claude/phase-2-procurement` (kế thừa Phase 1) |
| 3 | Inventory & Warehouse | ✅ Hoàn thành | Branch `claude/phase-3-inventory` (kế thừa Phase 2) |
| 4 | Distribution & Consignment | ✅ Hoàn thành | Branch `claude/phase-4-distribution` (kế thừa Phase 3) |
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
Phase 0-3: HOÀN THÀNH (Foundation, Procurement, Inventory & Warehouse). Chi
tiết xem git log các branch `claude/phase-1-foundation`,
`claude/phase-2-procurement`, `claude/phase-3-inventory` — không lặp lại ở
đây nữa. Quyết định kỹ thuật quan trọng đã chuyển vào mục "Quyết định kỹ
thuật" bên dưới.

Phase 4 - Distribution & Consignment: HOÀN THÀNH trên branch
`claude/phase-4-distribution` (kế thừa từ Phase 3).

Đã xong:
- Customer/Dealer Master: `src/modules/distribution/api/customers.ts` — CRUD
  Customer (mọi type), khi `type=DEALER` cho phép gửi kèm `dealerProfile`
  (tier/region/contractNumber/contractStart/contractEnd/committedRevenue/
  discountPolicy) tạo/update nested 1-1. Đây là Customer Master DÙNG CHUNG —
  Phase 5 (Sales) sẽ tái sử dụng, KHÔNG tạo lại.
- Consignment Agreement CRUD (crud-factory) — hạn mức tồn tối đa, chu kỳ đối
  soát theo từng đại lý.
- Consignment Shipment: tạo phiếu (REQUESTED, chưa đụng tồn kho) → action
  `deliver` (`consignment-shipment:deliver`) — trong 1 transaction: gọi
  `recordStockMovement` loại CONSIGNMENT_OUT trừ kho công ty (chặn âm kho,
  cơ chế dùng lại nguyên vẹn từ Phase 3) + cộng `ConsignmentBalance`
  (qtyShipped/qtyOnHand) cho đại lý. `ConsignmentBalance` KHÔNG dùng
  `InventoryBalance` — tồn ký gửi tách riêng theo đúng thiết kế
  docs/data-model.md mục 16.4 (hàng vẫn thuộc sở hữu công ty).
- Consignment Sales Report: đại lý báo bán → trừ `ConsignmentBalance`
  (qtySold tăng, qtyOnHand giảm), chặn báo bán vượt tồn ký gửi hiện có
  (`CONSIGNMENT_QTY_EXCEEDED`). CHỈ cập nhật balance — chuỗi side-effect đầy
  đủ (hóa đơn/công nợ/hoa hồng) để lại Phase 5/8/9, đã ghi rõ trong code.
- Consignment Reconciliation: tạo bản ghi đối soát theo kỳ, `systemQty` tự
  tính từ tổng `ConsignmentBalance.qtyOnHand` của đại lý, so với
  `dealerReportedQty` nhập tay → `varianceQty`; action PATCH đổi status
  OPEN → RESOLVED/DISPUTED.
- Stock Recall (thu hồi ký gửi): tạo phiếu (chặn nếu vượt tồn ký gửi hiện
  có) → action `receive` (`stock-recall:receive`, nhận kèm `warehouseId`) —
  `recordStockMovement` CONSIGNMENT_RETURN cộng vào kho công ty + cập nhật
  `ConsignmentBalance` (qtyOnHand giảm, qtyReturned tăng).
- Read-only Consignment Balance view (lọc theo đại lý).
- Đã kiểm thử THẬT qua curl full-cycle: tạo đại lý (kèm DealerProfile) → seed
  tồn kho công ty qua Stock Count (kỹ thuật hợp lệ để nạp tồn ban đầu, không
  phải nghiệp vụ mới) → ký gửi 20 đơn vị (giao hàng → kho công ty giảm đúng,
  ConsignmentBalance tăng đúng) → đại lý báo bán 5 (chặn báo bán 100 vượt
  tồn 15) → thu hồi 15 còn lại (kho công ty +15, ConsignmentBalance về 0) →
  tạo + resolve đối soát (systemQty tính đúng = 0). Playwright xác nhận UI.
  `npm run build`/`type-check`/`lint` đều sạch.

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 4):
- Credit Control đầy đủ ("không giao hàng nếu vượt hạn mức tín dụng") —
  Customer đã có `creditLimit`/`currentDebt` nhưng CHƯA có luồng nào kiểm
  tra/trừ nợ — thuộc Sales Order (Phase 5) khi phát sinh công nợ thật.
  Chưa cho phép PATCH DealerProfile khi Customer không đổi type (edge case
  nhỏ, không chặn — mapRowToForm phía UI Customer đã xử lý qua form riêng).
- Dealer Stock Count (đại lý tự kiểm kê tồn ký gửi, so khớp hệ thống) —
  business-spec 04 mục 12-18 mô tả luồng riêng, Phase 4 chỉ làm Reconciliation
  tổng theo kỳ (nhập tay dealerReportedQty), CHƯA làm form kiểm kê chi tiết
  theo từng SKU cho đại lý tự nhập.
- ConsignmentShipmentLine/StockRecallLine có field `serialId`/`lotId` trong
  schema nhưng Phase 4 chưa capture (giống Phase 3 làm cho GoodsReceipt) —
  để lại nếu cần theo dõi serial ký gửi (ECU/Turbo ký gửi) ở phase sau.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/distribution/**, src/app/api/distribution/**,
src/app/(app)/distribution/**, prisma/seed.ts (thêm resource customer/
consignment-agreement/consignment-shipment/consignment-balance/
consignment-sales-report/consignment-reconciliation/stock-recall).

---

Phase 5 - Sales Order & Customer: CHƯA BẮT ĐẦU. Customer Master đã có sẵn từ
Phase 4 (src/modules/distribution/api/customers.ts) — Phase 5 tái sử dụng,
không tạo lại.
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
- Mọi thay đổi tồn kho PHẢI qua `src/modules/inventory/lib/stock-ledger.ts#recordStockMovement()` — không tự ý update `InventoryBalance` trực tiếp ở module khác (tránh 2 nguồn sự thật, xem docs/data-model.md mục 16.2).
- Customer Master (bao gồm Dealer) thuộc module `distribution` (không phải `sales`) vì Phase 4 (Distribution) cần nó trước Phase 5 (Sales) theo đúng thứ tự ROADMAP — Phase 5 import và tái sử dụng, KHÔNG tạo lại Customer CRUD.
- Tồn kho ký gửi (`ConsignmentBalance`) tách hoàn toàn khỏi `InventoryBalance` — không dùng chung bảng, không coi đại lý là 1 Warehouse ảo. Khi ký gửi/thu hồi, `recordStockMovement` chỉ chạm vào phía kho công ty (CONSIGNMENT_OUT/CONSIGNMENT_RETURN); phía đại lý cập nhật thủ công qua `ConsignmentBalance` trong cùng transaction.
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
