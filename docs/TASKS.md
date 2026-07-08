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
| 5 | Sales Order & Customer | ✅ Hoàn thành | Branch `claude/phase-5-sales` (kế thừa Phase 4) |
| 6 | Logistics & Delivery | ✅ Hoàn thành | Branch `claude/phase-6-logistics` (kế thừa Phase 5) |
| 7 | Warranty/RMA/Field Service | ✅ Hoàn thành | Branch `claude/phase-7-warranty` (kế thừa Phase 6) |
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

Design refresh - "Liquid Glass" (áp dụng lại cho đúng tinh thần
docs/design-system.md): HOÀN THÀNH, thêm vào cùng branch
`claude/phase-4-distribution` (commit riêng sau Phase 4).

Lý do: UI trước đó về mặt chức năng đúng nhưng hiệu ứng kính gần như không
thấy được — nền toàn trang phẳng một màu (`surface-base` xám nhạt) khiến
`backdrop-filter: blur()` trên Card/Sidebar/Topbar không có gì để khúc xạ,
nhìn như card trắng thường có viền mờ chứ không phải "Liquid Glass".

Đã xong:
- Thêm lớp nền `.app-background` (fixed, z-index -1, phủ toàn viewport) chứa
  3 khối tròn màu lớn mờ nét (`blur(90px)`) — đây là điều kiện bắt buộc để
  hiệu ứng kính có tác dụng thị giác thật sự (xem docs/design-system.md mục
  2.1 phần "Nền mesh"). Light: xanh dương/hồng/xanh ngọc; Dark: tối hơn +
  giảm opacity 0.55→0.35 để không chói.
- Tăng blur bề mặt kính 20px→28px (Light) và 24px→32px (Dark), thêm
  `saturate(1.6)` để màu nền mesh "ánh" qua lớp kính rõ hơn; thêm token
  `--surface-glass-strong` (kính đậm hơn, dùng cho trạng thái active) và
  `--surface-glass-shine`/`--surface-glass-shadow` (viền sáng + đổ bóng mô
  phỏng ánh sáng phản chiếu trên kính thật).
- Đổi `brand-primary` từ `#2563EB` sang `#3B6DF0` (tương phản tốt hơn trên
  nền kính đậm màu hơn).
- Bo góc lại toàn bộ theo mục 4 (đã cập nhật docs/design-system.md khớp):
  Card/Table/khung nội dung chính `rounded-2xl`, input `rounded-xl`,
  Button `rounded-full` (pill, có glow shadow màu brand/danger).
- Card đổi từ nền kính sang `surface-solid` phẳng — Card nằm lồng bên trong
  khung `.glass-surface` của `<main>` nên tự thân không lặp lại hiệu ứng
  kính (tránh double-blur, đúng nguyên tắc mục 1.2 "bảng/số liệu dày đặc
  dùng nền phẳng").
- Sidebar active nav đổi từ "viền trái 2px" sang `.glass-surface-strong`
  dạng pill; AppShell/Sidebar/Topbar dùng `gap-3` giữa các khối để mỗi khối
  đọc như một tấm kính riêng nổi trên nền mesh.
- LoginForm viết lại dùng chung `Input`/`Label`/`Button`, khung form
  `rounded-3xl` trên nền `.glass-surface`.
- Đã xác nhận bằng Playwright screenshot cả Light và Dark mode (login +
  dashboard + 1 trang danh sách có bảng dữ liệu) — hiệu ứng kính hiện rõ,
  bảng dữ liệu vẫn đọc tốt (nền phẳng, không blur). `npm run type-check`,
  `npm run lint`, `npm run build` đều sạch.
- Đồng bộ docs/design-system.md mục 2.1/4/5/9 theo đúng giá trị đã cài đặt
  (trước đó tài liệu ghi giá trị blur/bo góc/màu cũ từ thời Phase 0, chưa
  cập nhật khi code thực tế đổi).

File liên quan: src/app/globals.css, src/app/layout.tsx,
src/components/layout/{AppShell,Sidebar,Topbar}.tsx,
src/components/ui/{Card,Button,Input,Table}.tsx,
src/modules/auth/components/LoginForm.tsx, src/app/login/page.tsx,
docs/design-system.md.

---

Phase 5 - Sales Order & Customer: HOÀN THÀNH trên branch `claude/phase-5-sales`
(kế thừa từ Phase 4). Customer Master tái sử dụng nguyên vẹn từ Phase 4
(src/modules/distribution/api/customers.ts) — chỉ bổ sung field `priceListId`
vào schema Zod của customer (đã có sẵn trong Prisma schema từ Phase 0 nhưng
Phase 4 chưa expose qua API).

Đã xong:
- Price List: CRUD (crud-factory) cho `PriceList` + resource con
  `PriceListItem` (đơn giá theo từng sản phẩm, quản lý ở trang con
  `/sales/price-lists/[id]/items` — cùng kiểu nested-resource với
  StorageLocation của Phase 1, không dùng crud-factory vì không có
  companyId trực tiếp).
- Quotation: tạo (nhiều dòng hàng) → `send` (Draft→Sent) → `accept`/`reject`
  → `convert` (Accepted → tạo SalesOrder mới copy nguyên dòng hàng, chặn
  convert 2 lần cho cùng 1 báo giá).
- Sales Order:
  - `confirm`: tính tổng tiền đơn hàng, kiểm tra 2 quy tắc theo
    docs/business-spec/05 mục 15 — (1) Credit Control: chặn cứng nếu
    `currentDebt + orderTotal > creditLimit` của khách hàng (không có
    override, nhất quán với cách `recordStockMovement` chặn âm kho); (2)
    Price Policy: nếu đơn giá dòng hàng thấp hơn `PriceListItem` (bảng giá
    gán cho khách) quá 20%, bắt buộc chọn người duyệt → tạo `ApprovalRequest`
    dùng lại nguyên khung Workflow Phase 1, set status `PENDING_APPROVAL`;
    ngược lại tự động `CONFIRMED`. `entity-sync.ts` thêm case "SalesOrder"
    (map APPROVED→CONFIRMED, REJECTED→CANCELLED vì SalesOrderStatus không
    có literal APPROVED/REJECTED như PurchaseRequestStatus).
  - `allocate`: giữ hàng (Stock Reservation) — thêm 2 hàm mới vào
    `src/modules/inventory/lib/stock-ledger.ts`: `reserveStock` (chuyển
    `availableQty`→`reservedQty`, KHÔNG đụng `onHandQty`) và
    `releaseReservation` (ngược lại, dùng khi hủy đơn). Tạo `StockReservation`
    theo từng dòng hàng. Xuất kho thật (ISSUE) để lại Phase 6 (Logistics) khi
    giao hàng thật.
  - `cancel`: hủy ở mọi trạng thái trừ đã giao/đã hóa đơn; nếu đang
    `ALLOCATED` thì giải phóng hết StockReservation trước khi chuyển
    `CANCELLED`.
  - Trang chi tiết `/sales/orders/[id]` xem hạn mức tín dụng, công nợ, từng
    dòng hàng (đã giữ/đã giao).
- Sales Return: tạo yêu cầu trả (theo SO đã Confirmed trở lên) → `approve`/
  `reject` → `receive` (nhập kho lại qua `recordStockMovement` type RECEIPT,
  yêu cầu chọn kho) → `qc` → `refund`. Hoàn tiền/đổi hàng thực tế (bút toán
  công nợ) để lại Phase 8 (Kế toán), đã ghi rõ trong code.
- Đã kiểm thử THẬT qua curl full-cycle: seed tồn kho 100 qua Stock Count →
  tạo khách hàng (creditLimit 1,000,000) + bảng giá (giá niêm yết 100,000) →
  gán bảng giá cho khách → tạo báo giá 10 sản phẩm giá niêm yết → gửi → chấp
  nhận → convert sang SO → confirm (tự động Confirmed vì đúng giá niêm yết,
  không cần duyệt) → allocate (reservedQty 10, availableQty 90 — đúng) →
  test chặn Credit Limit (đơn 5,000,000 > hạn mức 1,000,000 → lỗi
  CREDIT_LIMIT_EXCEEDED) → test chặn Price Policy (giá 50,000 = giảm 50% so
  với giá niêm yết → bắt buộc chọn người duyệt, thiếu thì lỗi validation) →
  confirm kèm approverUserId → tạo ApprovalRequest, SO chuyển
  PENDING_APPROVAL → duyệt qua `/api/workflow/approval-requests/:id/decide`
  → entity-sync tự chuyển SO sang CONFIRMED (xác nhận cơ chế tái sử dụng
  Workflow hoạt động đúng) → tạo Sales Return 2 sản phẩm → approve → receive
  (onHandQty 100→102, đúng) → qc → refund → cancel đơn đã Allocated (giải
  phóng reservation, reservedQty về 0, availableQty về 102 — đúng). Playwright
  xác nhận UI cả 5 trang (Bảng giá, chi tiết đơn giá, Báo giá, Đơn hàng bán +
  trang chi tiết, Trả hàng). `npm run build`/`type-check`/`lint` đều sạch.
- Sửa 1 bug phát hiện khi test UI: `parseSort()` mặc định fallback
  `{createdAt:"desc"}` nhưng `SalesReturn` chỉ có field `requestedAt` (không
  có `createdAt`) → phải truyền fallback tường minh
  `{requestedAt:"desc"}` (src/modules/sales/api/sales-returns.ts).
- Mở rộng `CrudPage` (dùng chung, không phải riêng Phase 5): thêm
  `type: "date"` cho `CrudField` (trước đây chỉ có text/number/select/
  checkbox/textarea, ngày optional phải nhập tay chuỗi ISO trong ô text) —
  dùng cho `effectiveFrom`/`effectiveTo` của Price List.

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 5):
- Lead Management, Opportunity Management (docs/business-spec/05 mục 7-8) —
  CRM trước bán hàng, không có model trong Prisma schema từ Phase 0 (schema
  chỉ có Quotation/SalesOrder/SalesReturn) → xác nhận đây là phạm vi bị cắt
  có chủ đích từ lúc thiết kế ERD, không phải thiếu sót của Phase 5.
  Customer Service/Ticket (mục 21) cũng vậy.
- Backorder Management chi tiết (mục 19) — SalesOrderLine đã có
  `qtyDelivered` để tính phần còn thiếu, nhưng chưa có màn hình/luồng riêng
  theo dõi ngày dự kiến có hàng cho phần backorder.
- Đơn hàng gấp (mục 18: đánh dấu ưu tiên, đẩy kho xử lý trước) — chưa có
  field priority trên SalesOrder.
- Giao hàng thật (xuất kho ISSUE, Picking, POD) và Invoice/Payment/Closed —
  để lại Phase 6 (Logistics) và Phase 8 (Kế toán) đúng theo ROADMAP, đã ghi
  chú trực tiếp trong SalesOrderDetailClient UI.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/sales/**, src/app/api/sales/**,
src/app/(app)/sales/**, src/modules/inventory/lib/stock-ledger.ts (thêm
reserveStock/releaseReservation), src/modules/workflow/lib/entity-sync.ts
(thêm case SalesOrder), src/modules/distribution/api/customers.ts (thêm
priceListId), src/modules/master-data/components/CrudPage.tsx (thêm field
type "date"), src/components/ui/Badge.tsx (thêm tone cho status mới),
prisma/seed.ts (thêm resource price-list/quotation/sales-order/sales-return).
```

---

Phase 6 - Logistics & Delivery: HOÀN THÀNH trên branch `claude/phase-6-logistics`
(kế thừa từ Phase 5). Đây là phase thực hiện bước "xuất kho thật" mà Phase 5
đã cố ý để lại (Sales Order chỉ dừng ở `ALLOCATED` — giữ hàng, chưa trừ tồn).

Đã xong:
- Master data logistics (crud-factory): Vehicle (xe nội bộ), Driver (gắn với
  Employee có sẵn từ Org), Carrier (đơn vị vận chuyển ngoài).
- Delivery Request: `createDeliveryRequestFromSalesOrder` — chỉ tạo được từ
  Sales Order đã `ALLOCATED`, copy các dòng còn `qtyReserved > qtyDelivered`,
  chặn tạo trùng cho cùng 1 SO. 3 nguồn còn lại trong enum
  `DeliverySourceType` (CONSIGNMENT_SHIPMENT/WARRANTY_REPLACEMENT/
  STOCK_TRANSFER) để lại — đã có luồng xuất kho riêng từ Phase 3-4, chưa cần
  bọc qua Delivery Request ở Phase 6.
- Shipment (chuyến hàng — gom chuyến theo docs/business-spec/06 mục 6):
  - `create`: chọn kho xuất + xe/tài xế/ĐVVC (optional) + nhiều Delivery
    Request đang `DRAFT` → tạo `ShipmentLine` theo từng dòng, chuyển các
    Delivery Request sang `PLANNED`.
  - `dispatch` (PLANNED→ON_DELIVERY): đây là nơi THỰC SỰ trừ tồn kho — gọi
    `recordStockMovement` type `ISSUE` (âm) cho từng dòng, đồng thời với
    nguồn SALES_ORDER thì gọi `releaseReservation` (giải phóng phần đã giữ
    từ Phase 5) và cộng `SalesOrderLine.qtyDelivered`. Chuyển Delivery
    Request liên quan sang `ON_DELIVERY`.
  - `pod` (ON_DELIVERY→DELIVERED): tạo `ProofOfDelivery` (người nhận, ghi
    chú), chuyển Delivery Request liên quan sang `DELIVERED`; với mỗi Sales
    Order liên quan, nếu MỌI dòng đã `qtyDelivered >= qty` thì tự động
    chuyển `SalesOrder.status = DELIVERED`.
  - `close` (DELIVERED→CLOSED): đóng chuyến + Delivery Request liên quan.
  - Delivery Cost: thêm chi phí (nhiên liệu/cầu đường/thuê ngoài/bốc xếp)
    gắn vào chuyến, xem ở trang chi tiết `/logistics/shipments/[id]` cùng
    danh sách POD.
- Đã kiểm thử THẬT qua curl full-cycle: seed tồn kho 50 → tạo + confirm +
  allocate SO 20 đơn vị (onHand 50/reserved 20/available 30) → tạo Delivery
  Request từ SO → tạo Shipment gom request đó → dispatch (onHand 50→30,
  reserved 20→0, available giữ 30 — đúng công thức) → kiểm tra
  `SalesOrderLine.qtyDelivered = 20` → ghi nhận POD → xác nhận `SalesOrder`
  tự chuyển `DELIVERED` → thêm chi phí giao hàng → đóng chuyến. Playwright
  xác nhận UI cả 6 trang (Xe, Tài xế, ĐVVC, Yêu cầu giao hàng, Chuyến hàng,
  chi tiết chuyến hàng có POD + chi phí). `npm run build`/`type-check`/
  `lint` đều sạch.
- Sửa 1 bug hạ tầng dùng chung phát hiện khi test UI: `createCrudApi`
  (crud-factory) không cho tùy biến sort mặc định — mọi resource crud-factory
  đều bị ép fallback `{createdAt:"desc"}` kể cả khi model không có cột
  `createdAt` (model `Driver` chỉ có `id`). Thêm option `defaultSort` vào
  `CrudConfig`, dùng cho Driver (`{id:"asc"}`) — cùng gốc bug với
  `SalesReturn` ở Phase 5, khác chỗ lần này sửa tận gốc ở factory dùng chung
  thay vì sửa từng nơi gọi.

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 6):
- Delivery Planning/Route Planning tự động (gom chuyến theo khu vực/tuyến
  đường - mục 6) — Phase 6 chỉ gom chuyến thủ công (người dùng tự chọn
  Delivery Request nào vào chuyến nào), chưa có gợi ý/tối ưu tuyến.
  Picking & Packing chi tiết (mục 9: số kiện, trọng lượng, nhãn) cũng chưa
  có — dispatch coi như xuất kho xong ngay, không có bước soạn hàng riêng.
- GPS Tracking, Delivery Tracking thời gian thực (mục 13-14) — không có hạ
  tầng GPS, ngoài phạm vi ERP nội bộ.
- Giao hàng thất bại/giao thiếu/giao sai + Delivery Return (mục 16-18) —
  Shipment hiện chỉ có đường đi thẳng PLANNED→ON_DELIVERY→DELIVERED→CLOSED,
  chưa có nhánh `FAILED` (dù đã có sẵn trong `DeliveryRequestStatus`) hay
  luồng trả hàng sau giao. Sales Return (Phase 5) xử lý trả hàng SAU KHI đã
  ghi nhận giao thành công — khác với "giao thất bại, hàng chưa từng đến
  tay khách" của mục này.
- Đơn hàng gấp (đánh dấu ưu tiên, đẩy xử lý trước) — field `priority` đã có
  sẵn trên `DeliveryRequest` nhưng chưa có UI nhập/hiển thị hay logic sắp
  xếp theo độ ưu tiên.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/logistics/**, src/app/api/logistics/**,
src/app/(app)/logistics/**, src/lib/api/crud-factory.ts (thêm option
defaultSort), prisma/seed.ts (thêm resource vehicle/driver/carrier/
delivery-request/shipment/delivery-cost).
```

---

Phase 7 - Warranty, RMA & Field Service: HOÀN THÀNH trên branch
`claude/phase-7-warranty` (kế thừa từ Phase 6).

Đã xong:
- Warranty Policy (crud-factory) — thời hạn bảo hành theo sản phẩm hoặc theo
  nhóm hàng (ưu tiên theo sản phẩm trước).
- Warranty Registration: kích hoạt bảo hành thủ công (đủ cho cả 3 nguồn "khi
  bán/khi lắp đặt/khi khách đăng ký" theo business-spec mục 5) — tự tính
  `warrantyEnd = soldAt + WarrantyPolicy.durationMonths`; chặn đăng ký nếu
  sản phẩm chưa có chính sách bảo hành nào.
- Warranty Claim: tạo (chặn nếu đã hết hạn bảo hành) → `inspect` → `approve`/
  `reject` → `repair` (tự tạo `RepairOrder` mới) HOẶC `replace` (đổi hàng mới
  — xuất kho serial mới qua `recordStockMovement` type `WARRANTY_OUT`, đánh
  dấu serial mới `SOLD` gán cho khách, đánh dấu serial cũ `DEFECTIVE`) →
  `close`.
- RMA (Return Material Authorization): tạo từ Warranty Claim HOẶC từ Sales
  Return (`refine` bắt buộc chọn đúng 1 nguồn) → `approve`/`reject` →
  `receive` (nhập kho qua `recordStockMovement` type `WARRANTY_IN`, đánh dấu
  serial `RETURNED`) → `qc` → `repair`/`replace` (trạng thái cuối, chưa có
  side-effect xuất kho thêm — xem "Còn thiếu").
- Core Return: theo dõi hàng cũ (ECU/Turbo...) phải thu hồi sau khi đã giao
  hàng mới — tạo → `receive`/`overdue`/`lost`. Chưa có job tự động chuyển
  PENDING→OVERDUE theo mốc 7/15/30 ngày (xem "Còn thiếu").
- Repair Order: tạo tự động khi Warranty Claim chọn "Sửa chữa" (không có form
  tạo tay riêng) → action `advance` di chuyển qua đúng 6 bước cố định
  (RECEIVED→DIAGNOSING→REPAIRING→TESTING→COMPLETED→RETURNED), không cho nhảy
  cóc/lùi bước.
- Field Service Request: tạo (Lắp đặt/Bảo trì/Sửa chữa) → `assign` (gán kỹ
  thuật viên = Employee có sẵn) → `start` → `complete`/`cancel`. Điều phối
  chỉ thủ công (người dùng tự chọn kỹ thuật viên), chưa có gợi ý theo
  khoảng cách/kỹ năng/lịch rảnh (mục 17).
- Đã kiểm thử THẬT qua curl full-cycle: tạo chính sách bảo hành 12 tháng →
  đăng ký bảo hành cho 1 serial → tạo claim → inspect → approve → replace
  bằng serial khác (xác nhận: onHand giảm 2→1, serial mới `SOLD`, serial cũ
  `DEFECTIVE`) → close claim → tạo RMA từ claim đó → approve → receive (xác
  nhận: onHand tăng 1→2 trở lại, serial cũ `RETURNED`) → qc → tạo Core Return
  → receive → tạo Field Service Request → assign → start → complete → tạo
  claim thứ 2 → repair (tự tạo Repair Order) → advance đủ 5 lần đến
  `RETURNED`. Playwright xác nhận UI cả 7 trang. `npm run build`/
  `type-check`/`lint` đều sạch.
- **Sửa 1 lỗi nghiêm trọng phát hiện khi test UI thật (không phải lỗi riêng
  Phase 7, mà là lỗi kiến trúc tích lũy từ Phase 1 lộ ra ở Phase 7):** JWT
  session nhúng thẳng toàn bộ mảng `permissions` (đến Phase 7 là 164 quyền)
  — cookie vượt quá giới hạn ~4096 byte/cookie mà trình duyệt cho phép (RFC
  6265), khiến trình duyệt (và cả `curl -c` cookie-jar) LẶNG LẼ từ chối lưu
  cookie. Hậu quả: đăng nhập trả về 200 (có vẻ thành công) nhưng session
  không bao giờ được lưu, mọi trang sau đó bị đá về `/login` — bug này tồn
  tại tiềm ẩn từ Phase 1 nhưng chỉ đủ lớn để vượt ngưỡng ở Phase 7 (111 quyền
  ở Phase 5 = ~3.7KB, an toàn; 164 quyền ở Phase 7 = ~5.1KB, vượt ngưỡng).
  **Cách sửa**: tách JWT thành 2 phần — `SessionTokenPayload` (chỉ
  sub/companyId/username/employeeId/roles, được KÝ vào cookie, luôn nhỏ) và
  `SessionPayload` (thêm `permissions`, được `getCurrentSession()` nạp lại
  từ DB ở MỖI request qua `loadUserPermissions()` thay vì giải mã từ JWT).
  Tác dụng phụ tích cực: đổi quyền của user có hiệu lực ngay, không cần đăng
  nhập lại như trước. Đổi lại: mỗi request tốn thêm 1 query nạp permission —
  chấp nhận được ở quy mô hiện tại.
- **Sửa tiếp 1 hệ quả của bản sửa trên**: `session.ts` giờ import
  `permissions.ts` (kéo theo Prisma) để gọi `loadUserPermissions` — nhưng
  `src/middleware.ts` (chạy Edge runtime, không chạy được Prisma) trước đó
  import `SESSION_COOKIE_NAME` từ `session.ts`, nên vô tình kéo TOÀN BỘ
  Prisma Client vào bundle middleware (build log cho thấy bundle middleware
  phình từ ~40KB lên ~113KB). Sửa bằng cách tách hằng số cookie ra file riêng
  `src/modules/auth/lib/session-constants.ts` (không import gì từ Prisma),
  middleware import thẳng từ file này thay vì từ `session.ts`. Xác nhận build
  lại middleware bundle về đúng ~40KB như cũ.

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 7):
- Lead time cảnh báo Core Return theo mốc 7/15/30 ngày (mục 13) và tự động
  chuyển PENDING→OVERDUE — hiện phải bấm tay action "Quá hạn".
  Chặn "không cấp hàng mới nếu khách chưa hoàn trả core cũ" (mục 13) cũng
  chưa có — WarrantyClaim.replace không kiểm tra CoreReturn tồn đọng.
  Đây là 2 điểm nghiệp vụ cùng nhóm, để lại vì cần thêm 1 loại cảnh
  báo/scheduler chưa có hạ tầng.
- RMA `repair`/`replace` là trạng thái cuối đơn thuần, chưa có side-effect
  xuất/nhập kho thực sự khi sửa xong/đổi xong tại kho bảo hành (khác với
  WarrantyClaim.replace đã có side-effect đầy đủ) — vì RMA phần lớn xử lý
  hàng ĐÃ thu hồi về kho, tình huống nghiệp vụ (sửa xong trả lại kho nào,
  đổi bằng serial nào) đa dạng hơn cần làm rõ thêm với business trước khi
  code cứng.
- Service Contract, Service KPI, Maintenance Management định kỳ (mục 3, 14
  business-spec) — không có model riêng trong Prisma schema từ Phase 0,
  ngoài phạm vi ERD đã chốt.
- Mobile app cho kỹ thuật viên, GPS check-in (mục 19) — ngoài phạm vi ERP nội
  bộ theo ROADMAP.
- Chưa có test tự động — vẫn kiểm thử thủ công qua curl + Playwright.

File liên quan: src/modules/warranty/**, src/app/api/warranty/**,
src/app/(app)/warranty/**, src/modules/auth/lib/session.ts (bỏ permissions
khỏi JWT, nạp lại từ DB mỗi request), src/modules/auth/lib/session-constants.ts
(mới — tách hằng số cookie khỏi session.ts để không kéo Prisma vào Edge
middleware), src/modules/auth/api/login.ts (JWT chỉ ký roles),
src/middleware.ts (đổi import sang session-constants.ts), prisma/seed.ts
(thêm resource warranty-policy/warranty-registration/warranty-claim/
rma-request/core-return/repair-order/field-service-request).
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
- Giữ hàng cho Sales Order (Stock Reservation) dùng 2 hàm riêng `reserveStock`/`releaseReservation` (src/modules/inventory/lib/stock-ledger.ts) — CHỈ chuyển `availableQty`↔`reservedQty`, không đụng `onHandQty`/tạo `StockMovement`. Xuất kho thật (ISSUE, trừ `onHandQty`) là hành động riêng thuộc Phase 6 (Logistics) khi giao hàng — Sales Order (Phase 5) dừng lại ở bước "giữ chỗ", không tự xuất kho.
- Sales Order dùng lại nguyên khung Workflow Phase 1 (ApprovalRequest) khi cần duyệt vượt chính sách giá — vì `SalesOrderStatus` không có literal APPROVED/REJECTED (khác `PurchaseRequestStatus`), `entity-sync.ts` phải map thủ công (APPROVED→CONFIRMED, REJECTED→CANCELLED) thay vì gán thẳng như case PurchaseRequest.
- `parseSort()` có fallback mặc định `{createdAt:"desc"}` — bảng nào KHÔNG có cột `createdAt` (vd. `SalesReturn` chỉ có `requestedAt`, `Driver` không có cột thời gian nào) PHẢI truyền fallback tường minh, nếu không Prisma sẽ báo lỗi `Unknown argument` lúc runtime (không bắt được ở type-check vì `orderBy` được build động). `createCrudApi` có option `defaultSort` cho đúng việc này.
- Xuất kho thật (trừ `onHandQty`, gọi `recordStockMovement` type `ISSUE`) CHỈ xảy ra ở bước `Shipment.dispatch()` (Phase 6) — không xảy ra ở Sales Order Phase 5 (chỉ giữ hàng) hay ở lúc tạo Delivery Request (chỉ là yêu cầu, chưa động vào kho). Đây là điểm phân chia trách nhiệm rõ giữa 2 phase, tránh trừ tồn 2 lần.
- `Shipment.status` dùng chung enum `DeliveryRequestStatus` với `DeliveryRequest` (không tạo enum `ShipmentStatus` riêng) vì 2 bảng đi cùng nhịp trạng thái (PLANNED→ON_DELIVERY→DELIVERED→CLOSED) theo đúng thiết kế ERD gốc — khi 1 Shipment chuyển trạng thái, code cập nhật `updateMany` cho mọi `DeliveryRequest` liên quan trong cùng transaction để đồng bộ.
- **KHÔNG BAO GIỜ nhúng danh sách permission đầy đủ vào JWT/cookie** (bài học đau từ Phase 7 — xem chi tiết ở "Việc đang dở" Phase 7). Cookie giới hạn ~4096 byte; hệ thống càng nhiều permission theo từng phase càng dễ vượt ngưỡng và trình duyệt sẽ LẶNG LẼ từ chối lưu (không báo lỗi rõ ràng). JWT (`SessionTokenPayload` trong session.ts) chỉ ký sub/companyId/username/employeeId/roles; `getCurrentSession()` nạp lại `permissions` từ DB mỗi request qua `loadUserPermissions()`.
- `src/middleware.ts` (Edge runtime) chỉ được import hằng số/hàm từ `src/modules/auth/lib/session-constants.ts` — TUYỆT ĐỐI không import từ `session.ts` (file này import `permissions.ts` → kéo theo Prisma Client, không chạy được ở Edge và làm phình bundle middleware). Khi thêm hằng số dùng chung giữa middleware và route handler, luôn cân nhắc đặt ở `session-constants.ts` thay vì `session.ts`.
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
