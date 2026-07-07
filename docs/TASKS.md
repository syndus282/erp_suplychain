# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | ✅ Hoàn thành | |
| 1 | Foundation (Auth, Master Data, Org, Workflow tối giản) | ✅ Hoàn thành | Branch `claude/phase-1-foundation` |
| 2 | Procurement & Entrusted Import | ⬜ | Sẽ làm trên branch riêng kế thừa Phase 1 |
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
Phase 0: HOÀN THÀNH (xem git log — không lặp lại chi tiết ở đây nữa).

Phase 1 - Foundation: HOÀN THÀNH trên branch `claude/phase-1-foundation`.

Đã xong:
- Scaffold Next.js 15.5.20 (App Router) + TypeScript + Tailwind v4, dùng chung
  repo với prisma/ đã có từ Phase 0. Next.js CỐ Ý pin bản 15.5.20 (không dùng
  16.x mới nhất) — 16.x đổi "middleware" → "proxy" và có lỗi Turbopack workspace
  root detection chưa ổn định lúc build schema này; 15.x là bản LTS-like ổn định
  hơn, hệ sinh thái tương thích rộng hơn.
- Auth: JWT session (thư viện `jose`) lưu trong cookie httpOnly `erp_session`
  (8h, KHÔNG sliding/idle-timeout — để lại cải tiến sau), mật khẩu hash bằng
  bcryptjs. Quyền (Role→RolePermission→Permission) nhúng thẳng vào JWT lúc
  đăng nhập — đổi quyền cần đăng nhập lại mới có hiệu lực (đánh đổi chấp nhận
  được ở Phase 1, ghi rõ trong code). Middleware (`src/middleware.ts`) chỉ check
  "có session hợp lệ" (edge runtime, không đụng Prisma); check Permission chi
  tiết theo resource:action nằm trong từng route handler
  (`requirePermission()` — src/modules/auth/lib/permissions.ts).
- Master Data CRUD đầy đủ (API + UI): Product (kèm vehicle compatibility
  nhiều-nhiều + supersession self-ref), ProductCategory, UnitOfMeasure,
  VehicleModel, Warehouse, StorageLocation (cây Zone/Rack/Level/Bin theo từng
  kho, trang riêng `/master-data/warehouses/[id]/locations`).
- Organization: Branch, Department, Position, Employee CRUD (API + UI).
- Workflow tối giản (đúng scope ROADMAP Phase 1: "request → 1 người duyệt,
  chưa cần escalation/notification"): `src/modules/workflow/lib/approval.ts`
  (createApprovalRequest/decideApprovalStep dùng entityType+entityId đa hình)
  + trang Hộp thư duyệt `/approvals`. Phase 2 (Purchase Order) sẽ là nơi đầu
  tiên GỌI THẬT `createApprovalRequest` — Phase 1 mới dừng ở hạ tầng dùng chung.
- UI shell "Liquid Glass": Sidebar/Topbar/AppShell + primitives dùng chung
  (Card/Button/Badge/Input/Select/Table) tại `src/components/ui` và
  `src/components/layout`, theo đúng token trong docs/design-system.md.
- Hạ tầng API dùng chung theo docs/api-contract.md: `src/lib/api/{response,
  errors,pagination,crud-factory}.ts` — envelope success/error chuẩn, mã lỗi
  chuẩn, phân trang, và 1 factory CRUD dùng lại cho mọi master-data/org resource
  đơn giản (không quan hệ nhiều-nhiều) để tránh lặp code giữa 9 resource.
- Đã kiểm thử THẬT (không chỉ type-check): chạy dev server, curl toàn bộ luồng
  auth + CRUD từng resource + workflow approve/reject + business-rule error,
  chụp screenshot Playwright (Chromium có sẵn) xác nhận UI render đúng, và
  `npm run build` (production build) qua sạch không lỗi.
- `npm run type-check` và `npm run lint` đều sạch (eslint.config.mjs dùng
  FlatCompat vì eslint-config-next@15.5.20 chưa export flat-config thuần).

Còn thiếu / để lại có chủ đích (KHÔNG phải sót việc Phase 1):
- Session sliding/idle-timeout thật (hiện chỉ có JWT hết hạn cố định 8h).
- Đổi quyền cần user đăng nhập lại (permissions nhúng trong JWT, không tra DB
  mỗi request) — chấp nhận được ở quy mô Phase 1, cân nhắc lại nếu cần revoke
  quyền tức thời sau này.
- ApprovalMatrix (ngưỡng giá trị/đa cấp), escalation, notification đa kênh —
  đúng theo ROADMAP thuộc Phase 10, KHÔNG làm ở đây.
- Chưa có test tự động (unit/integration) — mới kiểm thử thủ công qua curl +
  Playwright trong session. Chưa có file nào trong `__tests__/` của từng module.

File liên quan: package.json, next.config.ts, tsconfig.json, eslint.config.mjs,
postcss.config.mjs, src/app/**, src/modules/{auth,master-data,organization,
workflow}/**, src/lib/**, src/components/**, src/middleware.ts, prisma/seed.ts
(mở rộng seed Permission/Role ADMIN/User "admin").

---

Phase 2 - Procurement & Entrusted Import: BẮT ĐẦU NGAY SAU COMMIT NÀY, trên
branch riêng kế thừa từ claude/phase-1-foundation. Xem commit tiếp theo / phần
này sẽ được ghi đè khi Phase 2 xong.
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
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
