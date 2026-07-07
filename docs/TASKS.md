# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | ✅ Hoàn thành | Còn 1 việc nhỏ để ngỏ có chủ đích (scaffold Next.js) — xem "Việc đang dở" |
| 1 | Foundation (Auth, Master Data, Org, Workflow tối giản) | ⬜ | |
| 2 | Procurement & Entrusted Import | ⬜ | |
| 3 | Inventory & Warehouse | ⬜ | |
| 4 | Distribution & Consignment | ⬜ | |
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
Phase 0 - Tài liệu kỹ thuật nền: HOÀN THÀNH toàn bộ 5 tài liệu + schema + seed.

Đã xong:
- docs/data-model.md — ERD đầy đủ toàn bộ 15 nhóm bảng (Foundation, Master Data,
  Partner, Warehouse, Procurement, Inventory, Distribution/Consignment, Sales,
  Logistics, Warranty/RMA, Finance, HRM, Workflow). Nguồn: đọc toàn bộ
  docs/business-spec/01-14 + docs/ROADMAP.md.
- prisma/schema.prisma — khung ban đầu dựa 1-1 theo ERD: 95 model, 54 enum.
  Đã validate + generate + db push thử thành công (SQLite, Prisma 6.19.3).
  Tuân thủ đúng quy ước CLAUDE.md mục 4 (cuid, companyId, tiền tệ Int + currency).
- docs/currency-handling.md — quy tắc lưu Int theo đơn vị nhỏ nhất từng currency,
  quy ước chiều tỷ giá, công thức FX Gain/Loss, FX Revaluation cuối kỳ (khung,
  triển khai thật ở Phase 8), quy tắc làm tròn, bảng đối chiếu field trong schema.
- docs/nfr.md — hiệu năng, bảo mật (RBAC/audit/password policy), backup/RPO/RTO,
  toàn vẹn dữ liệu, observability, portability SQLite→SQL Server, i18n, compliance.
- docs/api-contract.md — URL convention, HTTP method mapping, envelope
  success/error, mã lỗi chuẩn, format tiền tệ/ngày giờ/enum, phân trang/lọc/sắp
  xếp, auth, validate 2 tầng (schema vs business rule), idempotency.
- docs/design-system.md — "Liquid Glass": token màu (surface kính + semantic),
  typography, spacing, danh sách component (card/button/input/badge/table/modal),
  icon (lucide-react), motion, dark mode. Đặc tả token — CHƯA cài Tailwind thật.
- prisma/seed.ts — seed 1 Company mặc định (code "DEFAULT", idempotent bằng
  upsert). Đã test: `prisma db push` + `prisma db seed` chạy thành công trên
  SQLite, chạy lại không tạo trùng.
- package.json bổ sung: tsx, typescript, @types/node (devDependencies) +
  cấu hình `prisma.seed`; tsconfig.json tối thiểu (chỉ scope prisma/**/*.ts,
  KHÔNG phải tsconfig đầy đủ cho Next.js).

Còn thiếu (để ngỏ có chủ đích, thuộc Phase 1, KHÔNG phải sót việc Phase 0):
- Scaffold Next.js (App Router) thực sự — hiện chỉ có package.json tối thiểu cho
  Prisma/seed, CHƯA có next/react. tsconfig.json hiện tại sẽ cần thay thế/mở
  rộng khi cài Next.js (Next tự sinh tsconfig riêng).
- Chưa chạy `npm run type-check` / `npm test` vì chưa có code ứng dụng nào
  (chỉ có schema.prisma + seed.ts) — không áp dụng ở bước này.
- Auth cụ thể (NextAuth hay tự viết), thư viện validate cụ thể (đề xuất zod) —
  đã chốt là "chưa chốt" tường minh trong docs/api-contract.md mục 10.

File liên quan: docs/data-model.md, docs/currency-handling.md, docs/nfr.md,
docs/api-contract.md, docs/design-system.md, prisma/schema.prisma,
prisma/seed.ts, package.json, tsconfig.json, .gitignore
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
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
