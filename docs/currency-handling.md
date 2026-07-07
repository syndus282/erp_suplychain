# currency-handling.md — Quy tắc xử lý Ngoại tệ & Tỷ giá

> Tài liệu nền Phase 0, mở rộng chi tiết từ `docs/ROADMAP.md` mục 2.1 và `CLAUDE.md` mục 4.
> Áp dụng xuyên suốt (không phải 1 phase riêng): `PurchaseOrder`, `ImportShipment`, `SupplierInvoice`, `Payment`; đánh giá lại cuối kỳ ở Phase 8 (Finance).

---

## 1. Nguyên tắc lưu trữ

- Mọi field tiền tệ lưu `Int` — là số nguyên theo **đơn vị nhỏ nhất có thể giao dịch** của đồng tiền đó, KHÔNG dùng `Float`/`Decimal` (lý do: tránh sai số dấu phẩy động khi migrate SQLite → SQL Server, xem CLAUDE.md mục 4).
- Đơn vị nhỏ nhất theo từng currency:

| Currency | Đơn vị nhỏ nhất | Ví dụ lưu Int | Diễn giải |
|---|---|---|---|
| `VND` | đồng (không có phần lẻ) | `1_500_000` | 1.500.000 ₫ |
| `USD` | cent (1/100 USD) | `150_000` | 1,500.00 USD |
| `EUR` | cent (1/100 EUR) | `98_000` | 980.00 EUR |
| `CNY` | fen (1/100 CNY) | `500_000` | 5,000.00 CNY |

  Quy tắc chung: `storedInt = round(amount * 10^decimalDigits(currency))`. `decimalDigits(VND) = 0`, các ngoại tệ phổ biến còn lại = 2 (theo chuẩn ISO 4217, trừ vài ngoại lệ hiếm như JPY = 0 — không phát sinh trong phạm vi ERP này nên chưa xử lý).
- Mọi bảng có field tiền PHẢI có kèm field `currency String` (mặc định `"VND"`) — đã áp dụng trong `prisma/schema.prisma`.
- Khi 1 bản ghi có nhiều field tiền (vd. `PurchaseOrderLine.unitPrice`, `discount`, `tax`, `totalAmount`) thì TẤT CẢ dùng chung 1 field `currency` ở bảng cha (`PurchaseOrder.currency`) — không lặp lại `currency` trên từng field.

---

## 2. Tỷ giá (Exchange Rate)

- Field `exchangeRate Float` chỉ xuất hiện ở bảng có giao dịch xuyên biên giới hoặc đa tiền tệ: `PurchaseOrder`, `JournalEntryLine`, `SupplierInvoice`, `Payment`. Các bảng nội địa thuần VND (Sales Order, Customer Invoice...) không cần `exchangeRate`.
- **Quy ước chiều tỷ giá**: `exchangeRate` luôn là "1 đơn vị ngoại tệ = X VND" (yết giá trực tiếp), bất kể `currency` là gì. Ví dụ `currency = "USD"`, `exchangeRate = 24500` nghĩa là 1 USD = 24.500 ₫.
- **Thời điểm chốt tỷ giá**: tỷ giá được ghi nhận (snapshot) tại thời điểm tạo chứng từ — không tự cập nhật lại sau đó. Mỗi bản ghi (PO, Invoice, Payment...) giữ tỷ giá riêng của thời điểm nó phát sinh.
- **Nguồn tỷ giá**: Phase 0-2 nhập thủ công (người dùng tự điền theo tỷ giá bán ra của ngân hàng tại thời điểm giao dịch). Tích hợp API tỷ giá tự động (Vietcombank/NHNN) là cải tiến để lại cho phase sau, KHÔNG thuộc phạm vi hiện tại (xem `docs/ROADMAP.md` mục 5-9: "gác lại").

### Công thức quy đổi

```
amountVND = round(amountForeignSmallestUnit / 10^decimalDigits(currency) * exchangeRate)
```

Ví dụ: PO trị giá 10,000.00 USD (`totalAmount = 1_000_000` theo cent), `exchangeRate = 24500`
→ `amountVND = round(1_000_000 / 100 * 24500) = 245_000_000` ₫.

---

## 3. Chênh lệch tỷ giá (FX Gain/Loss)

Phát sinh khi thời điểm **ghi nhận công nợ** (vd. `SupplierInvoice.exchangeRate`) khác thời điểm **thanh toán** (`Payment.exchangeRate`).

```
FX Difference (VND) = amountForeign * (paymentExchangeRate - invoiceExchangeRate)
```

- Nếu công nợ phải trả (AP) và tỷ giá thanh toán CAO hơn tỷ giá ghi nhận → phát sinh **lỗ tỷ giá** (ghi Nợ 635 – Chi phí tài chính).
- Nếu tỷ giá thanh toán THẤP hơn → phát sinh **lãi tỷ giá** (ghi Có 515 – Doanh thu tài chính).
- Ngược lại đối với công nợ phải thu (AR).
- Việc tự động sinh bút toán `JournalEntry` cho chênh lệch này thuộc **Phase 8 (Finance & Accounting)** — Phase 0 chỉ đảm bảo dữ liệu đầu vào (`exchangeRate` tại từng thời điểm) đã có sẵn trong schema để Phase 8 tính toán được, không cần truy hồi lại lịch sử.

---

## 4. Đánh giá lại số dư ngoại tệ cuối kỳ (FX Revaluation)

- Áp dụng cho số dư cuối kỳ của: công nợ phải trả ngoại tệ (`SupplierInvoice` chưa thanh toán hết), công nợ phải thu ngoại tệ, tiền mặt/tiền gửi ngân hàng ngoại tệ (`BankAccount.currency != baseCurrency`).
- Công thức: `Chênh lệch đánh giá lại = Số dư ngoại tệ * (Tỷ giá cuối kỳ - Tỷ giá đang ghi sổ)`.
- Bút toán chênh lệch đánh giá lại hạch toán vào TK 413 (Chênh lệch tỷ giá hối đoái) theo chuẩn kế toán VN, sau đó kết chuyển vào 515/635 cuối năm tài chính.
- **Thuộc phạm vi Phase 8**, KHÔNG triển khai ở Phase 0/1/2. Ở các phase sớm chỉ cần đảm bảo mọi field `amount`/`exchangeRate`/`currency` liên quan đã tồn tại đúng trong schema (đã có).

---

## 5. Làm tròn

- Làm tròn theo phương pháp "round half up" (làm tròn thông thường), thực hiện tại tầng ứng dụng (TypeScript) trước khi ghi Int vào DB — KHÔNG làm tròn ở tầng DB.
- Không cộng dồn sai số làm tròn qua nhiều dòng: khi phân bổ (allocate) một khoản tiền tổng cho nhiều dòng con (vd. `LandedCostAllocation`, phân bổ chiết khấu), dòng cuối cùng lấy phần dư (`remainder`) để đảm bảo tổng các dòng con luôn khớp chính xác với số tiền tổng — không dùng chia đều đơn thuần.

---

## 6. Bảng đối chiếu field trong schema hiện tại

| Model | Field tiền tệ | `currency` | `exchangeRate` |
|---|---|---|---|
| `PurchaseOrderLine` | `unitPrice`, `discount`, `tax`, `totalAmount` | qua `PurchaseOrder.currency` | qua `PurchaseOrder.exchangeRate` |
| `PurchaseOrder` | (tổng hợp từ lines) | ✅ | ✅ |
| `LandedCost` | `amount` | ✅ | — (landed cost luôn quy đổi về VND tại thời điểm ghi nhận, xem mục 7) |
| `SupplierInvoice` | `amount`, `paidAmount` | ✅ | ✅ |
| `CustomerInvoice` | `amount`, `paidAmount` | ✅ | — (nội địa, mặc định VND) |
| `Payment` | `amount` | ✅ | ✅ |
| `JournalEntryLine` | `debit`, `credit` | ✅ | ✅ |
| `PriceListItem`, `QuotationLine`, `SalesOrderLine` | giá bán | ✅ | — (nội địa VND) |

## 7. Landed Cost và ngoại tệ

`LandedCost.amount` lưu **đã quy đổi ra VND** tại thời điểm ghi nhận chi phí (vì các chi phí cấu thành landed cost có thể đến từ nhiều nguồn tiền tệ khác nhau — phí uỷ thác VND, cước tàu USD, bảo hiểm USD...). Field `currency` trên `LandedCost` ghi nhận đơn vị gốc để truy vết, nhưng `amount` luôn là số đã quy đổi — tránh phải cộng nhiều loại tiền tệ khác nhau khi phân bổ (`LandedCostAllocation`) vào giá vốn từng SKU.

---

## 8. Chưa xử lý (nằm ngoài phạm vi hiện tại)

- Tích hợp API tỷ giá tự động (Vietcombank/NHNN).
- Bảo hiểm hàng hóa đa tiền tệ (đã gác lại theo `docs/ROADMAP.md` mục 5-9).
- Đa loại tiền tệ cho `SalesOrder`/`CustomerInvoice` (hiện tại nội địa mặc định VND; bán hàng xuất khẩu ngoại tệ không thuộc phạm vi ERP hiện tại).
