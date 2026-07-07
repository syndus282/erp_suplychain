# design-system.md — "Liquid Glass" Design System

> Tài liệu nền Phase 0. Mọi UI từ Phase 1 trở đi tuân thủ chuẩn này (CLAUDE.md mục 7: "Mọi UI tuân thủ docs/design-system.md"). Nền tảng: Tailwind CSS trên Next.js App Router. Đây là đặc tả thiết kế (design tokens + nguyên tắc) — CHƯA cài đặt Next.js/Tailwind thật (thuộc Phase 1); khi scaffold Phase 1, dịch trực tiếp các token dưới đây vào `tailwind.config`.

---

## 1. Triết lý thiết kế

**"Liquid Glass"**: bề mặt kính mờ (glassmorphism) — nền bán trong suốt, hiệu ứng làm mờ hậu cảnh (backdrop blur), viền mỏng sáng nhẹ, bóng đổ mềm — tạo cảm giác các lớp UI "nổi" trên nền, phù hợp ERP nhiều màn hình dữ liệu dày đặc nhưng vẫn cần phân lớp thị giác rõ ràng (bảng, thẻ, sidebar, modal).

Nguyên tắc áp dụng:
1. **Phân lớp bằng độ trong suốt + blur**, không lạm dụng màu sắc rực rỡ để phân biệt vùng.
2. **Rõ ràng hơn đẹp**: đây là phần mềm nghiệp vụ (số liệu, bảng, trạng thái) — hiệu ứng kính chỉ áp dụng ở khung/container (card, sidebar, modal, top bar), KHÔNG áp dụng lên vùng chứa text/số liệu dày đặc (bảng dữ liệu dùng nền phẳng, độ tương phản cao để dễ đọc).
3. **Hỗ trợ cả Light và Dark mode** — mặc định theo `prefers-color-scheme`, cho phép người dùng chuyển tay.
4. **Accessibility không thỏa hiệp vì hiệu ứng đẹp**: mọi text trên nền kính phải đạt tối thiểu WCAG AA (contrast ratio ≥ 4.5:1 cho text thường, ≥ 3:1 cho text lớn/icon).

---

## 2. Design Tokens — Màu sắc

### 2.1 Nền & bề mặt kính (Surface)

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `surface-base` | `#F5F6F8` | `#0B0D12` | Nền toàn trang |
| `surface-glass` | `rgba(255,255,255,0.55)` + `backdrop-blur(20px)` | `rgba(24,26,32,0.55)` + `backdrop-blur(20px)` | Card, sidebar, top bar, modal |
| `surface-glass-border` | `rgba(255,255,255,0.35)` (viền 1px) | `rgba(255,255,255,0.08)` | Viền của bề mặt kính |
| `surface-solid` | `#FFFFFF` | `#15171D` | Bảng dữ liệu, form input — nền phẳng để đảm bảo đọc số liệu |
| `surface-overlay-scrim` | `rgba(15,17,21,0.4)` | `rgba(0,0,0,0.6)` | Lớp phủ phía sau modal/drawer |

### 2.2 Màu thương hiệu & ngữ nghĩa (Semantic)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `brand-primary` | `#2563EB` (xanh dương) | Nút hành động chính, link, focus ring |
| `brand-primary-hover` | `#1D4ED8` | Hover state của primary |
| `semantic-success` | `#16A34A` | Trạng thái hoàn tất/đạt (Delivered, Paid, Approved) |
| `semantic-warning` | `#D97706` | Cảnh báo (sắp hết hàng, sắp quá hạn) |
| `semantic-danger` | `#DC2626` | Lỗi, quá hạn, vi phạm quy tắc (âm kho, quá hạn công nợ) |
| `semantic-info` | `#0891B2` | Thông tin trung tính (đang xử lý, đang vận chuyển) |
| `text-primary` | Light `#0F1115` / Dark `#F2F3F5` | Text chính |
| `text-secondary` | Light `#5B6270` / Dark `#9AA1AE` | Text phụ, label, placeholder |
| `text-disabled` | Light `#A6ACB8` / Dark `#585E68` | Text/control vô hiệu hóa |

Trạng thái nghiệp vụ (badge) map trực tiếp vào 4 màu semantic ở trên — KHÔNG tự chế thêm màu mới cho mỗi loại status; nhóm theo ý nghĩa:
- `success`: `COMPLETED`, `APPROVED`, `PAID`, `DELIVERED`, `CLOSED`
- `warning`: `PENDING_APPROVAL`, `PARTIALLY_RECEIVED`, `PARTIALLY_PAID`
- `danger`: `REJECTED`, `CANCELLED`, `OVERDUE`, `FAILED`
- `info`: `DRAFT`, `SHIPPING`, `IN_PROGRESS`

### 2.3 Kiểm tra contrast

Trước khi thêm màu mới vào bảng trên, PHẢI kiểm tra contrast ratio với nền tương ứng (surface-base/surface-glass) bằng công cụ (vd. WebAIM Contrast Checker) — không thêm màu "cho đẹp" nếu không đạt AA.

---

## 3. Typography

| Token | Giá trị | Dùng cho |
|---|---|---|
| Font chính | `Inter` (fallback: `-apple-system, "Segoe UI", sans-serif`) | Toàn bộ UI — hỗ trợ tiếng Việt có dấu tốt |
| Font số liệu | `"Inter", tabular-nums` | Bảng số liệu, tiền tệ — dùng `font-variant-numeric: tabular-nums` để số thẳng cột |
| `text-xs` | 12px / line-height 16px | Caption, helper text |
| `text-sm` | 14px / line-height 20px | Body phụ, label, bảng dữ liệu |
| `text-base` | 16px / line-height 24px | Body chính |
| `text-lg` | 18px / line-height 28px | Tiêu đề section |
| `text-xl` | 22px / line-height 30px | Tiêu đề trang |
| `text-2xl` | 28px / line-height 36px | Số liệu nổi bật (KPI, dashboard) |

Trọng số: `font-normal` (400) cho body, `font-medium` (500) cho label/nhấn nhẹ, `font-semibold` (600) cho tiêu đề — không dùng `font-bold` (700) tràn lan, giữ giao diện nhẹ nhàng đúng tinh thần "liquid glass".

---

## 4. Spacing & Layout

- Thang spacing theo bội số 4px: `4, 8, 12, 16, 24, 32, 48, 64` — map trực tiếp Tailwind spacing scale mặc định (`1, 2, 3, 4, 6, 8, 12, 16`), không tự định nghĩa thang riêng.
- Bo góc (`border-radius`): `rounded-lg` (12px) cho card/input, `rounded-xl` (16px) cho modal/panel lớn, `rounded-full` cho badge/avatar. Bề mặt kính luôn bo góc ≥ 12px — góc vuông không phù hợp hiệu ứng kính.
- Bố cục chuẩn: sidebar trái cố định (điều hướng module) + top bar (breadcrumb, user menu, notification) + vùng nội dung chính. Sidebar và top bar dùng `surface-glass`; vùng nội dung dùng `surface-base`.
- Bảng dữ liệu (data table) luôn dùng `surface-solid`, không áp blur — ưu tiên đọc nhanh số lượng lớn dòng.

---

## 5. Component chính

| Component | Nguyên tắc |
|---|---|
| **Card** | `surface-glass` + viền `surface-glass-border` 1px + `shadow-sm` mềm. Padding tối thiểu 16px. |
| **Button primary** | Nền `brand-primary`, chữ trắng, `rounded-lg`, không dùng hiệu ứng kính (cần độ tương phản cao, rõ ràng là nút bấm). |
| **Button secondary/ghost** | Nền `surface-glass` nhạt hoặc trong suốt hoàn toàn, viền 1px `surface-glass-border`. |
| **Input/Form field** | `surface-solid`, viền 1px `text-secondary` nhạt, focus ring `brand-primary` 2px. KHÔNG dùng nền kính cho input — cần độ tương phản ổn định khi gõ liệu. |
| **Badge/Status pill** | Nền màu semantic ở độ mờ 12-15% (`bg-success/15`), chữ màu semantic đậm hơn (`text-success`), `rounded-full`, `text-xs font-medium`. |
| **Modal/Dialog** | `surface-glass` + `surface-overlay-scrim` phía sau, `rounded-xl`, animation fade+scale nhẹ khi mở (mục 7). |
| **Data table** | `surface-solid`, header sticky, hàng zebra rất nhạt (`odd:bg-black/[0.02]` dark: `odd:bg-white/[0.02]`), hover row `bg-brand-primary/5`. |
| **Sidebar navigation** | `surface-glass`, mục đang active có nền `brand-primary/10` + viền trái 2px `brand-primary`. |
| **KPI Card (Dashboard)** | `surface-glass`, số liệu dùng `text-2xl font-semibold tabular-nums`, label phụ `text-sm text-secondary` phía trên. |

---

## 6. Icon

- Bộ icon thống nhất: `lucide-react` (outline style, đồng bộ độ dày nét 1.5-2px) — chọn vì nhẹ, đầy đủ icon nghiệp vụ (kho, xe, hóa đơn...), tree-shakeable.
- Kích thước chuẩn: 16px (inline với text-sm), 20px (button/nav mặc định), 24px (tiêu đề/empty state).
- Màu icon mặc định theo `text-secondary`, chuyển `text-primary` khi active/hover.

---

## 7. Chuyển động (Motion)

- Thời lượng: 150ms (hover/focus), 200-250ms (mở/đóng modal, dropdown), KHÔNG dùng animation dài hơn 300ms cho thao tác thường xuyên (làm chậm cảm giác thao tác trên phần mềm nghiệp vụ dùng cả ngày).
- Easing: `ease-out` khi xuất hiện, `ease-in` khi biến mất.
- Tôn trọng `prefers-reduced-motion`: tắt animation không thiết yếu khi user bật chế độ giảm chuyển động.

---

## 8. Trạng thái tương tác

- Mọi phần tử tương tác (button, input, row có thể click) PHẢI có rõ 4 trạng thái: `default`, `hover`, `focus-visible` (viền/ring rõ ràng — bắt buộc cho keyboard navigation), `disabled` (giảm opacity còn ~40%, `cursor-not-allowed`).
- Loading state: dùng skeleton (khung xám nhấp nháy nhẹ) cho bảng/card đang tải, KHÔNG dùng spinner toàn trang che hết nội dung cũ khi chỉ refresh 1 phần dữ liệu.

---

## 9. Dark Mode

- Mặc định theo `prefers-color-scheme` của hệ điều hành, có toggle thủ công lưu vào `localStorage`.
- Hiệu ứng kính ở Dark mode cần blur mạnh hơn nhẹ (24px thay vì 20px) vì nền tối làm giảm cảm giác phân lớp — bù lại bằng viền sáng nhẹ hơn (`rgba(255,255,255,0.08)`).
- KHÔNG đảo ngược đơn giản màu semantic (success/warning/danger) giữa 2 mode — giữ nguyên hue, chỉ điều chỉnh độ sáng để đảm bảo contrast.

---

## 10. Áp dụng cho Tailwind (tham khảo khi setup Phase 1)

Khi khởi tạo `tailwind.config` ở Phase 1, map trực tiếp các token mục 2-4 vào `theme.extend.colors`/`theme.extend.borderRadius`/`theme.extend.boxShadow`. File CLAUDE.md mục 3 đã chốt Tailwind CSS làm nền tảng — tài liệu này chỉ chốt token, KHÔNG chốt trước cấu trúc file config cụ thể (tránh trùng lặp/lệch khi Phase 1 thực sự cài đặt).

---

## 11. Chưa chốt / để lại khi triển khai Phase 1

- Bộ component library nền (tự viết hoàn toàn bằng Tailwind hay dựa trên Radix UI/shadcn/ui) — quyết định khi bắt đầu code UI thật.
- Logo/brand mark chính thức của doanh nghiệp — chưa có, dùng placeholder text đến khi có.
- Bản responsive chi tiết cho mobile (ưu tiên thấp theo `docs/nfr.md` mục 9).
