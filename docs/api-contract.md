# api-contract.md — Chuẩn API dùng chung

> Tài liệu nền Phase 0. MỌI API từ Phase 1 trở đi phải tuân thủ chuẩn này (CLAUDE.md mục 7: "Mọi API tuân thủ docs/api-contract.md"). Áp dụng cho Next.js App Router API routes (`src/modules/<module>/api/`).

---

## 1. Cấu trúc URL

```
/api/<module>/<resource>[/:id][/<sub-resource>]
```

Ví dụ:
```
GET    /api/procurement/purchase-orders
POST   /api/procurement/purchase-orders
GET    /api/procurement/purchase-orders/:id
PATCH  /api/procurement/purchase-orders/:id
GET    /api/procurement/purchase-orders/:id/lines
POST   /api/procurement/purchase-orders/:id/approve
```

- `<module>` khớp tên thư mục trong `src/modules/` (vd. `procurement`, `inventory`, `sales`).
- Resource dùng danh từ số nhiều, kebab-case (`purchase-orders`, không phải `purchaseOrder` hay `purchase_order`).
- Hành động nghiệp vụ không map thẳng vào CRUD (approve, reject, close, cancel, post...) dùng dạng `POST /:id/<action>` — không lạm dụng PATCH cho hành động có side-effect nghiệp vụ lớn (đổi trạng thái + sinh giao dịch liên quan).
- KHÔNG đánh version URL (`/api/v1/...`) ở giai đoạn hiện tại — hệ thống nội bộ, không có external consumer cần version cứng. Nếu cần versioning sau này, thêm prefix `/api/v2/` chỉ cho endpoint thay đổi breaking, giữ nguyên `/api/` cho phần còn lại.

---

## 2. Phương thức HTTP

| Method | Dùng cho |
|---|---|
| `GET` | Đọc dữ liệu (danh sách, chi tiết) — không có side-effect |
| `POST` | Tạo mới, hoặc thực hiện 1 hành động nghiệp vụ (`/approve`, `/cancel`...) |
| `PATCH` | Cập nhật một phần bản ghi (partial update) |
| `PUT` | KHÔNG dùng trong dự án này (dùng PATCH thống nhất, tránh nhầm lẫn semantics) |
| `DELETE` | Chỉ dùng cho bản ghi CHƯA phát sinh giao dịch liên quan (vd. xóa dòng nháp). Bản ghi đã phát sinh giao dịch dùng cập nhật `status` (vd. `CANCELLED`), không xóa cứng — theo `docs/nfr.md` mục 5 |

---

## 3. Envelope phản hồi

### Thành công

```json
{
  "success": true,
  "data": { ... },
  "meta": { }
}
```

- `data`: object (chi tiết 1 bản ghi) hoặc array (danh sách).
- `meta`: optional, chứa thông tin phân trang (mục 5) — bỏ qua nếu không áp dụng.

### Lỗi

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Số lượng đặt hàng phải lớn hơn 0",
    "details": [
      { "field": "lines[0].qty", "message": "Phải lớn hơn 0" }
    ]
  }
}
```

- `code`: mã lỗi dạng `SCREAMING_SNAKE_CASE`, ổn định (dùng để FE xử lý logic theo mã, không parse `message`).
- `message`: tiếng Việt, hiển thị trực tiếp cho người dùng.
- `details`: optional, dùng cho lỗi validate nhiều field cùng lúc.

### Mã lỗi chuẩn dùng chung

| HTTP Status | `code` | Ý nghĩa |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Input không hợp lệ (schema validation) |
| 401 | `UNAUTHENTICATED` | Chưa đăng nhập / token hết hạn |
| 403 | `FORBIDDEN` | Không đủ quyền (Permission) |
| 404 | `NOT_FOUND` | Không tìm thấy bản ghi |
| 409 | `CONFLICT` | Xung đột trạng thái (vd. duyệt PO đã bị hủy, mã trùng) |
| 422 | `BUSINESS_RULE_VIOLATION` | Vi phạm quy tắc nghiệp vụ (vượt tín dụng, âm kho, vượt ngân sách...) |
| 500 | `INTERNAL_ERROR` | Lỗi hệ thống không lường trước |

`BUSINESS_RULE_VIOLATION` PHẢI có `details` mô tả rõ quy tắc bị vi phạm (vd. `{"rule": "CREDIT_LIMIT_EXCEEDED", "creditLimit": 500000000, "currentDebt": 480000000, "orderAmount": 50000000}`) để FE hiển thị đúng ngữ cảnh và log lại được.

---

## 4. Định dạng dữ liệu

- **JSON field**: `camelCase`, khớp 1-1 với tên field trong `prisma/schema.prisma` — không đổi tên field giữa DB và API để tránh mapping thừa.
- **Tiền tệ**: luôn trả `Int` (đơn vị nhỏ nhất) kèm field `currency` đi cùng, đúng như lưu trong DB — KHÔNG tự ý chia cho 100 hay format chuỗi tiền tệ ở tầng API. Việc format hiển thị (`1.500.000 ₫`) là trách nhiệm của FE, theo `docs/currency-handling.md`.
- **Ngày giờ**: ISO 8601 UTC (`"2026-07-07T10:30:00.000Z"`) cho cả request và response. FE tự quy đổi sang giờ địa phương khi hiển thị.
- **ID**: string (cuid), không bao giờ dùng số nguyên tăng dần.
- **Enum**: trả nguyên giá trị enum của Prisma (`"PENDING_APPROVAL"`), không dịch sang tiếng Việt ở tầng API — việc dịch label hiển thị là của FE (i18n mapping riêng).
- **Trường null vs field vắng mặt**: field không có giá trị trả `null` tường minh, không omit khỏi JSON (giúp FE không cần phân biệt "chưa có" và "không tồn tại").

---

## 5. Phân trang, lọc, sắp xếp (cho endpoint danh sách)

### Request (query params)

```
GET /api/inventory/products?page=1&pageSize=20&sort=code:asc&status=ACTIVE&search=phanh
```

| Param | Ý nghĩa | Mặc định |
|---|---|---|
| `page` | Trang hiện tại (bắt đầu từ 1) | `1` |
| `pageSize` | Số bản ghi/trang | `20`, tối đa `100` |
| `sort` | `<field>:<asc\|desc>`, hỗ trợ nhiều field cách nhau bởi dấu phẩy | theo `createdAt:desc` |
| `search` | Tìm kiếm full-text trên các field chính (định nghĩa riêng theo từng resource) | — |
| `<field>=<value>` | Lọc chính xác theo field (vd. `status=ACTIVE`, `warehouseId=xxx`) | — |

Danh sách LỚN (Product, Customer, InventoryBalance, StockMovement...) BẮT BUỘC phân trang — không được trả toàn bộ bảng trong 1 response (theo `docs/nfr.md` mục 1).

### Response

```json
{
  "success": true,
  "data": [ { "...": "..." } ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 134,
    "totalPages": 7
  }
}
```

---

## 6. Xác thực & Phân quyền

- Header `Authorization: Bearer <token>` (cơ chế cụ thể — session cookie hay JWT — chốt ở Phase 1 khi dựng Auth; tài liệu này chỉ chốt CONTRACT, không chốt cơ chế lưu trữ token).
- Mọi API (trừ `/api/auth/login`) yêu cầu xác thực. Thiếu/hết hạn → `401 UNAUTHENTICATED`.
- Kiểm tra `Permission` tương ứng resource + action trước khi xử lý request. Không đủ quyền → `403 FORBIDDEN`, KHÔNG rò rỉ thông tin về việc bản ghi có tồn tại hay không (trả 403 thay vì 404 khi user có quyền xem resource nói chung nhưng bị chặn ở scope dữ liệu cụ thể — tùy ngữ cảnh, quyết định cụ thể khi triển khai Phase 1).

---

## 7. Validate & Quy tắc nghiệp vụ

- Validate schema đầu vào (kiểu dữ liệu, field bắt buộc, định dạng) BẮT BUỘC ở tầng API route trước khi chạm vào business logic — dùng thư viện validate (khuyến nghị `zod`, chốt cụ thể khi setup Next.js ở Phase 1) để định nghĩa schema tường minh, tự sinh lỗi `VALIDATION_ERROR` nhất quán.
- Validate quy tắc nghiệp vụ (âm kho, vượt tín dụng, vượt ngân sách, giá dưới giá sàn...) nằm ở `lib/` của từng module (CLAUDE.md mục 5), trả `422 BUSINESS_RULE_VIOLATION` — KHÔNG trộn lẫn với `400 VALIDATION_ERROR`.
- Mọi thao tác ghi ảnh hưởng nhiều bảng (vd. duyệt PO tạo `ApprovalRequest`, xác nhận bán ký gửi cập nhật `ConsignmentBalance` + tạo `Invoice`) PHẢI chạy trong 1 Prisma transaction (`prisma.$transaction`) — không chấp nhận trạng thái nửa vời khi lỗi giữa chừng.

---

## 8. Idempotency

- Các API tạo giao dịch tài chính/tồn kho quan trọng (`POST /payments`, `POST /goods-receipts`, `POST /stock-movements`) nên hỗ trợ header `Idempotency-Key` (client tự sinh) để tránh tạo trùng khi retry do timeout mạng — triển khai khi các module này được xây (Phase 2 trở đi), Phase 0 chỉ chốt convention header name để nhất quán.

---

## 9. Ví dụ đầy đủ

**Request:**
```
POST /api/procurement/purchase-orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "supplierId": "clxxx...",
  "currency": "USD",
  "exchangeRate": 24500,
  "lines": [
    { "productId": "clyyy...", "qty": 100, "unitPrice": 500 }
  ]
}
```

**Response thành công (201):**
```json
{
  "success": true,
  "data": {
    "id": "clzzz...",
    "code": "PO-2026-0001",
    "supplierId": "clxxx...",
    "currency": "USD",
    "exchangeRate": 24500,
    "status": "DRAFT",
    "createdAt": "2026-07-07T10:00:00.000Z"
  }
}
```

**Response lỗi nghiệp vụ (422):**
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Không thể tạo PO: đơn hàng vượt ngân sách phòng ban còn lại",
    "details": { "rule": "BUDGET_EXCEEDED", "remainingBudget": 100000000, "orderAmount": 150000000 }
  }
}
```

---

## 10. Chưa chốt / để lại khi triển khai Phase 1

- Cơ chế xác thực cụ thể (NextAuth/session tự viết/JWT) — chốt khi dựng module Auth.
- Thư viện validate cụ thể (đề xuất `zod`) — chốt khi khởi tạo package.json đầy đủ cho Next.js.
- Rate limiting cụ thể cho API public-facing (nếu có cổng đại lý/portal ngoài mạng nội bộ).
