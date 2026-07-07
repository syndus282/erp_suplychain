# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | 🔶 Đang làm dở | ERD + Prisma schema khung ban đầu xong. Còn thiếu 4 tài liệu — xem phần "Việc đang dở" |
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
Phase 0 - Tài liệu kỹ thuật nền:

Đã xong:
- docs/data-model.md — ERD đầy đủ toàn bộ 15 nhóm bảng (Foundation, Master Data,
  Partner, Warehouse, Procurement, Inventory, Distribution/Consignment, Sales,
  Logistics, Warranty/RMA, Finance, HRM, Workflow). Nguồn: đọc toàn bộ
  docs/business-spec/01-14 + docs/ROADMAP.md.
- prisma/schema.prisma — khung ban đầu dựa 1-1 theo ERD: 95 model, 54 enum.
  Đã validate + generate + db push thử thành công (SQLite, Prisma 6.19.3).
  Tuân thủ đúng quy ước CLAUDE.md mục 4 (cuid, companyId, tiền tệ Int + currency).
- package.json (tối thiểu: prisma + @prisma/client), .env.example, .gitignore
  (node_modules/.env/dev.db) — thêm vì cần để schema chạy/validate được,
  KHÔNG phải scaffold Next.js đầy đủ (việc đó thuộc Phase 1).

Còn thiếu (chưa làm trong session này, cần làm trước khi coi Phase 0 hoàn tất):
- docs/currency-handling.md — chi tiết cơ chế tỷ giá/FX Gain-Loss (khung đã phác
  ở ROADMAP mục 2.1 và data-model.md mục 1, nhưng chưa viết tài liệu riêng).
- docs/nfr.md — non-functional requirements (hiệu năng, bảo mật, backup...).
- docs/api-contract.md — chuẩn API dùng chung (REST convention, response envelope,
  error format, phân trang...).
- docs/design-system.md — chuẩn UI "Liquid Glass" (màu sắc, component, spacing).
- Seed 1 company mặc định (ROADMAP có nhắc tới nhưng chưa làm) — cần prisma/seed.ts
  + cấu hình "prisma.seed" trong package.json + có thể cần tsx làm dev dependency.
- Scaffold Next.js (App Router) thực sự — hiện chỉ có package.json tối thiểu cho
  Prisma, CHƯA có next/react/typescript. Việc này nên làm ở đầu Phase 1.
- Chưa chạy `npm run type-check` / `npm test` vì chưa có code TypeScript nào
  (chỉ có schema.prisma) — không áp dụng ở bước này.

File liên quan: docs/data-model.md, prisma/schema.prisma, package.json, .gitignore
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
- Xem đầy đủ tại CLAUDE.md mục 3-4 và ERD tại docs/data-model.md

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
