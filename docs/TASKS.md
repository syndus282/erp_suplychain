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
Phase 0-2: HOÀN THÀNH (Foundation, Procurement & Entrusted Import). Chi tiết
xem git log các branch `claude/phase-1-foundation` và `claude/phase-2-procurement`
— không lặp lại ở đây nữa. Quyết định kỹ thuật quan trọng của các phase đó đã
được chuyển vào mục "Quyết định kỹ thuật" bên dưới.

Phase 3 - Inventory & Warehouse: HOÀN THÀNH trên branch `claude/phase-3-inventory`
(kế thừa từ Phase 2).

Đã xong:
- `src/modules/inventory/lib/stock-ledger.ts#recordStockMovement()` — ĐIỂM GHI
  NHẬN DUY NHẤT cho mọi biến động tồn kho: tạo `StockMovement` (sổ cái) rồi
  cập nhật `InventoryBalance` (cache) trong cùng 1 lần gọi, chặn âm kho
  (`NEGATIVE_STOCK` business rule) nếu onHandQty sau thay đổi < 0. MỌI module
  cần đổi tồn kho (Procurement, và sau này Sales/Distribution) PHẢI gọi qua
  hàm này trong 1 `prisma.$transaction`, không tự update InventoryBalance
  trực tiếp ở nơi khác.
- Nối `recordStockMovement` vào GoodsReceipt (Phase 2 đã cố ý để trống chỗ
  này): nhận hàng giờ tạo StockMovement(RECEIPT) + cập nhật InventoryBalance
  thật. Đồng thời bổ sung capture Serial Number (bắt buộc nhập đủ N serial
  khi Product.manageSerial, validate số nguyên) và Lot Number (tạo/tái dùng
  LotBatch khi Product.manageLot) ngay trong GoodsReceiptsClient (Phase 2 UI
  được sửa lại, không phải tạo mới).
- Stock Transfer (điều chuyển kho): tạo phiếu (PENDING_APPROVAL) → action
  `ship` (permission `stock-transfer:ship`, TRANSFER_OUT trừ kho nguồn, chặn
  âm kho) → action `receive` (`stock-transfer:receive`, TRANSFER_IN cộng kho
  đích). Đơn giản hóa còn 3 trạng thái (bỏ APPROVED/PICKING/RECEIVED trung
  gian trong enum) — đủ cho Phase 3, có thể mở rộng sau. Chỉ hỗ trợ
  kho-tới-kho (`toCustomerId` — điều chuyển tới đại lý — để Phase 4).
- Stock Count (kiểm kê): tạo phiếu snapshot `systemQty` từ InventoryBalance
  hiện tại (DRAFT) → `submit` ghi actualQty + tính varianceQty
  (`stock-count:submit`) → `approve` tạo StockMovement(ADJUSTMENT) cho từng
  dòng có chênh lệch rồi đóng phiếu (`stock-count:approve`).
- Read-only views: Inventory Balance (lọc theo kho), Stock Movement ledger
  (lọc theo kho, badge màu theo loại), Serial Number (lọc theo trạng
  thái/tìm serial).
- Đã kiểm thử THẬT qua curl: nhận hàng ECU (manageSerial=true) → chặn nếu
  thiếu serial → nhận đủ serial → InventoryBalance/SerialNumber/StockMovement
  đúng → điều chuyển 2/3 sang kho khác → chặn ship vượt tồn (transfer thứ 2
  qty=10) → ship/receive thành công, balance 2 kho đúng → kiểm kê phát hiện
  thiếu 1 → approve → ADJUSTMENT áp dụng đúng, balance về 0, sổ cái hiển thị
  đủ 4 dòng lịch sử đúng thứ tự. Playwright xác nhận UI render đúng. `npm run
  build`/`type-check`/`lint` đều sạch.

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 3):
- Consignment (ký gửi đại lý) — `toCustomerId` trên StockTransfer, warehouse
  ảo cho đại lý — thuộc Phase 4.
- Reservation (giữ hàng cho Sales Order) chưa dùng `reservedQty`/`StockReservation`
  — Phase 5 (Sales) sẽ cần cập nhật `reservedQty` khi giữ hàng.
  `recordStockMovement` hiện chỉ đụng `onHandQty`/`availableQty`, CHƯA đụng
  `reservedQty` — nhớ tính lại `availableQty = onHand - reserved` khi Phase 5
  bắt đầu ghi vào `reservedQty`.
- Hàng đang vận chuyển quốc tế (`inTransitQty`, "Hàng đang về") — field đã có
  trong schema nhưng chưa có luồng cập nhật; cân nhắc khi làm sâu hơn tracking
  lô hàng nhập khẩu.
- Costing method (FIFO/Moving Average) chưa tính — `recordStockMovement`
  chưa gắn giá vốn vào từng StockMovement, việc này thuộc Phase 8 (Finance)
  theo docs/data-model.md mục 17.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/inventory/**, src/app/api/inventory/**,
src/app/(app)/inventory/**, src/modules/procurement/api/goods-receipts.ts
(sửa), src/modules/procurement/components/GoodsReceiptsClient.tsx (sửa),
prisma/seed.ts (thêm resource inventory-balance/stock-movement/stock-transfer/
stock-count/serial-number).

---

Phase 4 - Distribution & Consignment: BẮT ĐẦU TIẾP THEO, trên branch riêng kế
thừa từ claude/phase-3-inventory.
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
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
