# TÀI LIỆU 08 - FINANCE & ACCOUNTING MANAGEMENT

# Quản lý Tài chính, Kế toán và Giá vốn

---

# 1. MỤC TIÊU

Phân hệ Finance & Accounting Management quản lý toàn bộ hoạt động tài chính kế toán của doanh nghiệp phân phối phụ tùng ô tô.

Mục tiêu:

* Ghi nhận đầy đủ giao dịch tài chính.
* Quản lý doanh thu, chi phí, lợi nhuận.
* Quản lý công nợ phải thu đại lý.
* Quản lý công nợ phải trả nhà cung cấp.
* Tính đúng giá vốn hàng nhập khẩu ủy thác.
* Quản lý chi phí mua hàng.
* Theo dõi hiệu quả từng sản phẩm, đại lý, khu vực.
* Kết nối dữ liệu từ bán hàng, kho, nhập khẩu, bảo hành.

---

# 2. ĐẶC THÙ KẾ TOÁN DOANH NGHIỆP PHÂN PHỐI PHỤ TÙNG Ô TÔ

Khác với doanh nghiệp sản xuất, doanh nghiệp phân phối có đặc điểm:

* Không tự sản xuất hàng hóa.
* Nhập hàng thông qua nhập khẩu ủy thác.
* Giá vốn phụ thuộc nhiều chi phí phát sinh.
* Có nhiều SKU.
* Có hàng tồn kho giá trị lớn.
* Có hàng ký gửi.
* Có hàng bảo hành.
* Có hàng đổi trả.

ERP phải quản lý được:

```text
Giá mua hàng
+
Phí ủy thác nhập khẩu
+
Thuế nhập khẩu
+
Thuế không được khấu trừ
+
Chi phí vận chuyển
+
Chi phí kho
+
Chi phí liên quan

=
Giá vốn thực tế
```

---

# 3. PHẠM VI PHÂN HỆ

Bao gồm:

* General Ledger (GL)
* Accounts Payable (AP)
* Accounts Receivable (AR)
* Cash Management
* Bank Management
* Inventory Accounting
* Cost Accounting
* Fixed Asset
* Budget Management
* Financial Reporting
* Tax Management

---

# 4. CẤU TRÚC KẾ TOÁN

## 4.1 Hệ thống tài khoản

Quản lý:

* Tài khoản kế toán.
* Nhóm tài khoản.
* Loại tài khoản.

---

Ví dụ:

```text
111 - Tiền mặt

112 - Tiền gửi ngân hàng

131 - Phải thu khách hàng

331 - Phải trả nhà cung cấp

156 - Hàng hóa

511 - Doanh thu

632 - Giá vốn
```

---

# 5. GENERAL LEDGER (GL)

## Mục tiêu

Quản lý sổ cái và bút toán kế toán.

---

## Nguồn tạo bút toán

* Mua hàng.
* Nhập kho.
* Xuất kho.
* Bán hàng.
* Thu tiền.
* Chi tiền.
* Tài sản.
* Lương.

---

# 6. JOURNAL ENTRY MANAGEMENT

## Các loại chứng từ

* Phiếu thu.
* Phiếu chi.
* Hóa đơn mua hàng.
* Hóa đơn bán hàng.
* Bút toán điều chỉnh.
* Bút toán phân bổ.

---

## Thông tin

Ngày hạch toán.

Số chứng từ.

Loại chứng từ.

Nội dung.

Tài khoản Nợ.

Tài khoản Có.

Số tiền.

Đối tượng liên quan.

---

# 7. KIỂM SOÁT BÚT TOÁN

## Kiểm tra

Tổng Nợ = Tổng Có.

---

Không cho sửa chứng từ đã khóa sổ.

---

Yêu cầu duyệt khi:

* Số tiền lớn.
* Điều chỉnh cuối kỳ.
* Xóa chứng từ.

---

# 8. ACCOUNTS PAYABLE (AP)

# Quản lý công nợ phải trả

---

## Đối tượng

* Nhà cung cấp phụ tùng.
* Đơn vị nhập khẩu ủy thác.
* Nhà vận chuyển.
* Nhà cung cấp dịch vụ.

---

# 9. QUẢN LÝ NHẬP KHẨU ỦY THÁC TRONG KẾ TOÁN

## Mô hình

```text
Nhà cung cấp nước ngoài

        ↓

Đơn vị nhập khẩu ủy thác

        ↓

Doanh nghiệp
```

---

## Theo dõi

Hợp đồng ủy thác.

Phí ủy thác.

Thuế.

Chi phí phát sinh.

Công nợ với đơn vị ủy thác.

---

# 10. TÍNH GIÁ VỐN NHẬP KHO

## Chi phí cấu thành

Bao gồm:

* Giá mua.
* Phí ủy thác.
* Phí vận chuyển quốc tế.
* Bảo hiểm.
* Thuế nhập khẩu.
* Phí cảng.
* Chi phí thông quan.
* Chi phí vận chuyển nội địa.

---

## Phân bổ chi phí

Theo:

* Giá trị.
* Trọng lượng.
* Số lượng.
* Thể tích.

---

Ví dụ:

```text
Lô hàng:

Giá mua:
10 tỷ

Phí nhập khẩu:
500 triệu

Vận chuyển:
200 triệu


Tổng giá trị:
10.7 tỷ
```

---

# 11. INVENTORY ACCOUNTING

## Mục tiêu

Liên kết kho với kế toán.

---

## Giao dịch tạo bút toán

### Nhập kho

Nợ:
156 - Hàng hóa

Có:
331 - Phải trả

---

### Xuất bán

Nợ:
632 - Giá vốn

Có:
156 - Hàng hóa

---

# 12. TÍNH GIÁ VỐN

Hỗ trợ:

## Moving Average

Phù hợp phân phối.

---

## FIFO

Theo lô nhập.

---

## Standard Cost

Theo giá chuẩn.

---

Đề xuất:

Moving Average kết hợp theo dõi landed cost.

---

# 13. ACCOUNTS RECEIVABLE (AR)

# Quản lý phải thu khách hàng

---

## Đối tượng

* Đại lý.
* Garage.
* Khách hàng doanh nghiệp.
* Dự án.

---

# 14. CÔNG NỢ ĐẠI LÝ

## Theo dõi

Tổng nợ.

---

Nợ đến hạn.

---

Nợ quá hạn.

---

Hạn mức tín dụng.

---

---

## Aging Report

Ví dụ:

```text
0-30 ngày

31-60 ngày

61-90 ngày

>90 ngày
```

---

# 15. THU TIỀN

## Hình thức

* Tiền mặt.
* Chuyển khoản.
* Bù trừ công nợ.

---

## Theo dõi

Phiếu thu.

Ngân hàng.

Đơn hàng.

Hóa đơn.

---

# 16. CASH MANAGEMENT

## Quản lý dòng tiền

Theo dõi:

* Thu tiền.
* Chi tiền.
* Dự báo dòng tiền.

---

## Dashboard

Tiền hiện có.

Dòng tiền tuần.

Dòng tiền tháng.

---

# 17. BANK MANAGEMENT

## Quản lý

Tài khoản ngân hàng.

Giao dịch ngân hàng.

Sao kê.

---

## Đối chiếu ngân hàng

Bank Reconciliation.

---

Tự động phát hiện:

* Giao dịch chưa ghi nhận.
* Sai số tiền.
* Sai ngày.

---

# 18. FIXED ASSET

# Quản lý tài sản cố định

---

## Tài sản

Ví dụ:

* Xe giao hàng.
* Máy móc.
* Thiết bị văn phòng.

---

## Quản lý

Ngày mua.

Nguyên giá.

Khấu hao.

Giá trị còn lại.

---

# 19. DEPRECIATION

## Phương pháp

Đường thẳng.

---

Theo thời gian sử dụng.

---

## Cảnh báo

* Tài sản sắp hết khấu hao.
* Chưa tính khấu hao.

---

# 20. COST CENTER MANAGEMENT

## Mục tiêu

Phân tích chi phí theo đơn vị.

---

Ví dụ:

* Kho miền Nam.
* Phòng kinh doanh.
* Bộ phận bảo hành.
* Chi nhánh Hà Nội.

---

# 21. PROFITABILITY ANALYSIS

## Phân tích lợi nhuận

Theo:

* Sản phẩm.
* Nhóm sản phẩm.
* Đại lý.
* Khu vực.
* Nhân viên bán hàng.

---

Ví dụ:

```text
SKU A

Doanh thu:
1 tỷ

Giá vốn:
700 triệu

Lợi nhuận:
300 triệu
```

---

# 22. BUDGET MANAGEMENT

## Quản lý ngân sách

Các nhóm:

* Marketing.
* Logistics.
* Kho.
* Nhân sự.
* Bảo hành.

---

## Kiểm soát

So sánh:

Ngân sách.

Thực tế.

Chênh lệch.

---

# 23. TAX MANAGEMENT

## Quản lý thuế

Bao gồm:

* VAT.
* Thuế nhập khẩu.
* Thuế nhà thầu.
* Thuế thu nhập doanh nghiệp.

---

## Báo cáo

* VAT đầu vào.
* VAT đầu ra.
* Tờ khai thuế.

---

# 24. FINANCIAL REPORTING

## Báo cáo tài chính

* Bảng cân đối kế toán.
* Báo cáo kết quả kinh doanh.
* Báo cáo lưu chuyển tiền tệ.

---

# 25. BÁO CÁO QUẢN TRỊ

## Doanh thu

Theo:

* Ngày.
* Tháng.
* Khu vực.
* Đại lý.

---

## Lợi nhuận

Theo:

* SKU.
* Nhãn hàng.
* Kênh bán.

---

## Kho

* Giá trị tồn kho.
* Hàng chậm luân chuyển.

---

## Công nợ

* Đại lý nợ nhiều.
* Nợ quá hạn.

---

# 26. DASHBOARD TÀI CHÍNH

## CFO Dashboard

Bao gồm:

* Doanh thu.
* Gross Profit.
* Net Profit.
* Cash Flow.
* AR Aging.
* AP Aging.
* Inventory Value.

---

# 27. KPI

## Tài chính

Gross Margin.

Net Margin.

Cash Conversion Cycle.

---

## Công nợ

DSO.

Collection Rate.

Overdue Ratio.

---

## Kho

Inventory Turnover.

Inventory Holding Cost.

---

# 28. KIỂM SOÁT QUAN TRỌNG

## Công nợ

* Không cho giao hàng vượt hạn mức.
* Cảnh báo nợ quá hạn.
* Khóa khách hàng rủi ro.

---

## Kho

* Không cho âm kho.
* Không cho điều chỉnh giá vốn không duyệt.

---

## Kế toán

* Không sửa chứng từ đã khóa.
* Không xóa bút toán đã ghi sổ.
* Kiểm soát phân quyền.

---

# 29. TÍCH HỢP

## Procurement

Giá mua.

Công nợ nhà cung cấp.

---

## Inventory

Giá trị tồn kho.

Giá vốn.

---

## Sales

Doanh thu.

Công nợ khách hàng.

---

## Logistics

Chi phí giao hàng.

---

## Warranty

Chi phí bảo hành.

---

## HRM

Chi phí nhân sự.

---

# 30. KẾT LUẬN

Phân hệ Finance & Accounting Management là nơi hợp nhất toàn bộ hoạt động kinh doanh thành dữ liệu tài chính.

Đối với doanh nghiệp phân phối phụ tùng ô tô, ERP phải trả lời được:

* Một sản phẩm nhập về thực tế giá bao nhiêu?
* Lô hàng nào đang có lợi nhuận tốt?
* Đại lý nào mang lại doanh thu nhưng rủi ro công nợ?
* Hàng tồn kho đang chiếm bao nhiêu vốn?
* Chi phí bảo hành là bao nhiêu?
* Doanh nghiệp đang tạo ra lợi nhuận thực sự ở đâu?

Một hệ thống ERP tốt không chỉ ghi nhận kế toán mà phải giúp ban lãnh đạo điều hành doanh nghiệp dựa trên dữ liệu tài chính chính xác.
