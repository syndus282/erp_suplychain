# TASKS.md — Trạng thái tiến độ (LUÔN ĐỌC ĐẦU SESSION, LUÔN CẬP NHẬT CUỐI SESSION)

> Đây là "bộ nhớ sống" thay thế cho lịch sử chat. Claude Code không nhớ session trước — nó chỉ biết những gì ghi ở đây. Xoá phần đã xong lâu, chỉ giữ thông tin còn hữu ích để tránh file phình to.

---

## Trạng thái tổng thể

| Phase | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 0 | Tài liệu kỹ thuật nền (ERD, Currency, NFR, API Contract, Design System) | ⬜ Chưa bắt đầu | |
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
(để trống — điền khi có task chưa xong giữa chừng, ví dụ:)

Phase 2 - Purchase Order:
- Đã xong: schema PurchaseOrder, PurchaseOrderLine
- Đang làm: API POST /api/purchase-orders (chưa xong validate credit/budget)
- Còn thiếu: UI form tạo PO
- File liên quan: src/modules/procurement/api/purchase-order.ts
```

---

## Quyết định kỹ thuật quan trọng đã chốt (không tự ý đổi)

- Tiền tệ lưu Int, không Decimal/Float (lý do: SQLite → SQL Server migrate an toàn)
- Khóa chính dùng cuid string
- Mọi bảng chính có companyId
- Xem đầy đủ tại CLAUDE.md mục 3-4

## Vấn đề/rủi ro đã phát hiện (điền khi gặp)

```
(để trống)
```
