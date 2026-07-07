# CLAUDE.md — ERP Chuỗi Cung Ứng Phụ Tùng Ô Tô

> File này được Claude Code tự động đọc ở ĐẦU MỖI session. Giữ ngắn gọn — mỗi dòng ở đây tốn token trong mọi lần gọi. Không dán toàn bộ tài liệu nghiệp vụ vào đây; chỉ trỏ đường dẫn để Claude tự đọc khi cần.

## 1. Dự án là gì

ERP quản lý chuỗi cung ứng phụ tùng ô tô: nhập khẩu ủy thác → kho → phân phối/ký gửi → bán hàng → giao hàng → bảo hành → tài chính → nhân sự. Chi tiết nghiệp vụ đầy đủ nằm ở `docs/business-spec/` (KHÔNG đọc hết, chỉ đọc file liên quan đến module đang làm).

## 2. Trạng thái tổng thể — LUÔN ĐỌC FILE NÀY TRƯỚC

`docs/TASKS.md` — chứa phase nào đã xong, đang làm, chưa bắt đầu. Đọc trước khi bắt đầu bất kỳ việc gì.

## 3. Tech stack (bắt buộc tuân thủ, không tự đổi)

- Ngôn ngữ: TypeScript toàn bộ (frontend + backend)
- Framework: Next.js (App Router)
- ORM: Prisma — schema tại `prisma/schema.prisma`
- DB dev: SQLite (`prisma/dev.db`) → DB production sau này: SQL Server (chưa migrate, không tự ý đổi provider)
- UI: Tailwind CSS, theo Design System tại `docs/design-system.md` (phong cách "Liquid Glass")

## 4. Quy tắc dữ liệu bắt buộc (vi phạm = lỗi nghiêm trọng khi migrate DB)

- **Tiền tệ**: lưu dạng `Int` (đơn vị nhỏ nhất, ví dụ đồng), KHÔNG dùng `Float`/`Decimal`. Field tiền luôn đi kèm field `currency`.
- **Khóa chính**: dùng `String @id @default(cuid())`, KHÔNG dùng auto-increment số.
- **Mọi bảng nghiệp vụ chính**: phải có `companyId String` (hiện tại chỉ có 1 company mặc định, nhưng field phải tồn tại sẵn).
- **Ngày giờ**: lưu UTC, kiểu `DateTime` chuẩn Prisma.
- Trước khi tạo bảng mới: đọc `prisma/schema.prisma` hiện tại để tránh trùng/xung đột với bảng module khác.

## 5. Cấu trúc thư mục

```
prisma/schema.prisma       # Nguồn sự thật duy nhất về data model
docs/business-spec/        # 14 tài liệu nghiệp vụ gốc (đọc theo module, không đọc hết)
docs/ROADMAP.md             # Kế hoạch phase chi tiết
docs/TASKS.md                # Trạng thái cập nhật liên tục — đọc đầu mỗi session, ghi cuối mỗi session
docs/api-contract.md        # Chuẩn API dùng chung
docs/design-system.md       # Chuẩn UI Liquid Glass
src/modules/<ten-module>/   # Code theo module, KHÔNG gộp chung 1 thư mục lớn
  ├── api/                  # route handlers
  ├── components/           # UI riêng của module
  ├── lib/                  # business logic
  └── __tests__/            # test riêng module
```

Mỗi module là 1 thư mục độc lập trong `src/modules/`. Khi làm module A, không đọc/sửa code module B trừ khi thực sự cần tích hợp.

## 6. Quy tắc làm việc mỗi session (BẮT BUỘC)

1. Đọc `docs/TASKS.md` để biết đang ở đâu.
2. Chỉ làm ĐÚNG 1 module/1 task trong 1 session. Không gộp nhiều phase.
3. Trước khi code: đọc đúng file nghiệp vụ liên quan trong `docs/business-spec/`, đúng phần `prisma/schema.prisma` liên quan — không đọc toàn bộ repo.
4. Code xong: chạy `npm run type-check` và `npm test` — đây là "trọng tài" khách quan thay vì dựa vào trí nhớ hội thoại.
5. Commit nhỏ, message rõ ràng theo module (ví dụ: `feat(inventory): add stock transfer API`).
6. **Cuối session: cập nhật `docs/TASKS.md`** (đánh dấu hoàn thành/dở dang, ghi chú việc còn lại). Đây là bước quan trọng nhất để session sau không bị mất ngữ cảnh.
7. Nếu 1 task lớn, chủ động đề xuất chia nhỏ thay vì cố làm hết trong 1 session dài.

## 7. Quy tắc code

- Ưu tiên đơn giản, không tự ý thêm abstraction/pattern chưa được yêu cầu.
- Không tạo lại cấu trúc đã có trong `prisma/schema.prisma` — mở rộng, không trùng lặp.
- Mọi API tuân thủ `docs/api-contract.md`.
- Mọi UI tuân thủ `docs/design-system.md`.
