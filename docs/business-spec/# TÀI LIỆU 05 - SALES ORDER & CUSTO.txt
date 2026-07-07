# TÀI LIỆU 05 - SALES ORDER & CUSTOMER MANAGEMENT

# Quản lý Bán hàng, Đơn hàng và Khách hàng

---

# 1. MỤC TIÊU

Phân hệ Sales Order & Customer Management quản lý toàn bộ quá trình bán hàng từ khi phát sinh nhu cầu của khách hàng đến khi hoàn tất giao hàng, xuất hóa đơn và thu tiền.

Mục tiêu:

* Quản lý tập trung thông tin khách hàng.
* Quản lý cơ hội bán hàng.
* Quản lý báo giá.
* Quản lý đơn hàng.
* Kiểm soát giá bán.
* Kiểm soát tồn kho trước khi xác nhận đơn hàng.
* Kiểm soát hạn mức tín dụng.
* Theo dõi tiến độ thực hiện đơn hàng.
* Kết nối với kho, giao hàng, kế toán và chăm sóc khách hàng.

---

# 2. PHẠM VI QUẢN LÝ

Bao gồm:

* Customer Master
* Customer Segmentation
* Lead Management
* Opportunity Management
* Quotation Management
* Sales Order Management
* Pricing Management
* Discount Management
* Credit Control
* Order Fulfillment
* Invoice Management
* Collection Tracking

---

# 3. MÔ HÌNH BÁN HÀNG

Doanh nghiệp phân phối phụ tùng ô tô thường có nhiều kênh bán hàng:

```text
Công ty phân phối
        |
        |
 -------------------------------
 |              |              |
Đại lý        Garage       Khách hàng dự án
 |
 |
Khách hàng cuối
```

---

# 4. CÁC LOẠI KHÁCH HÀNG

## 4.1 Đại lý

Đặc điểm:

* Mua thường xuyên.
* Có bảng giá riêng.
* Có hạn mức tín dụng.
* Có chính sách chiết khấu.

---

## 4.2 Garage / Xưởng sửa chữa

Đặc điểm:

* Mua theo nhu cầu sửa chữa.
* Cần giao hàng nhanh.
* Có thể mua nhiều mã nhỏ.

---

## 4.3 Showroom

Đặc điểm:

* Trưng bày sản phẩm.
* Có thể kết hợp ký gửi.

---

## 4.4 Khách hàng doanh nghiệp

Ví dụ:

* Công ty vận tải.
* Đội xe.
* Nhà máy.

---

## 4.5 Khách hàng lẻ

Có thể mua trực tiếp hoặc qua kênh online.

---

# 5. CUSTOMER MASTER

## 5.1 Thông tin chung

Mã khách hàng.

Tên khách hàng.

Loại khách hàng.

Nhóm khách hàng.

Mã số thuế.

Địa chỉ.

Khu vực.

---

## 5.2 Thông tin liên hệ

Người liên hệ.

Số điện thoại.

Email.

Chức vụ.

---

## 5.3 Thông tin thương mại

Nhân viên phụ trách.

Kênh bán hàng.

Bảng giá áp dụng.

Chiết khấu.

Hạn mức tín dụng.

Điều khoản thanh toán.

---

## 5.4 Lịch sử giao dịch

Theo dõi:

* Đơn hàng.
* Doanh số.
* Công nợ.
* Bảo hành.
* Khiếu nại.

---

# 6. CUSTOMER SEGMENTATION

Phân nhóm khách hàng.

---

## Theo loại

* Đại lý.
* Garage.
* Nhà phân phối.
* Dự án.
* Cá nhân.

---

## Theo giá trị

Ví dụ:

```text
VIP

A

B

C

Inactive
```

---

## Theo khu vực

* Miền Bắc.
* Miền Trung.
* Miền Nam.

---

## Theo ngành

* Ô tô con.
* Xe tải.
* Xe công trình.
* Đội xe.

---

# 7. LEAD MANAGEMENT

## Mục tiêu

Quản lý khách hàng tiềm năng trước khi phát sinh đơn hàng.

---

## Nguồn Lead

* Website.
* Marketing.
* Hội chợ.
* Nhân viên kinh doanh.
* Giới thiệu.

---

## Thông tin Lead

Tên khách hàng.

Nhu cầu.

Sản phẩm quan tâm.

Ngân sách.

Thời gian mua dự kiến.

Nhân viên phụ trách.

---

## Trạng thái

```text
New
↓
Contacted
↓
Qualified
↓
Opportunity
↓
Won
↓
Lost
```

---

# 8. OPPORTUNITY MANAGEMENT

## Mục tiêu

Quản lý cơ hội bán hàng có giá trị lớn.

---

## Thông tin

Khách hàng.

Giá trị dự kiến.

Sản phẩm.

Xác suất thành công.

Ngày dự kiến chốt.

Đối thủ cạnh tranh.

---

## Cảnh báo

Cơ hội lâu không cập nhật.

---

Cơ hội sắp hết hạn.

---

# 9. QUOTATION MANAGEMENT

## Mục tiêu

Quản lý báo giá gửi khách hàng.

---

## Thông tin báo giá

Số báo giá.

Ngày tạo.

Khách hàng.

Nhân viên bán hàng.

Thời hạn hiệu lực.

---

## Chi tiết hàng hóa

Mã hàng.

Tên hàng.

Số lượng.

Đơn giá.

Chiết khấu.

Thuế.

Thành tiền.

---

# 10. QUẢN LÝ GIÁ BÁN

## Loại giá

Giá niêm yết.

---

Giá đại lý.

---

Giá garage.

---

Giá dự án.

---

Giá đặc biệt.

---

# 11. QUẢN LÝ CHIẾT KHẤU

## Theo khách hàng

Ví dụ:

Đại lý A:

10%

---

## Theo sản phẩm

Ví dụ:

Lọc dầu:

5%

---

## Theo chương trình

Ví dụ:

Khuyến mãi tháng 7.

---

# 12. QUY TẮC GIÁ

## Kiểm tra

Giá bán >= Giá sàn.

---

Không được vượt mức chiết khấu cho phép.

---

Phải có phê duyệt khi:

* Giảm giá vượt mức.
* Bán dưới giá vốn.
* Bán hàng đặc biệt.

---

# 13. SALES ORDER

## Mục tiêu

Ghi nhận đơn hàng chính thức.

---

## Quy trình

```text
Quotation
↓
Sales Order
↓
Credit Check
↓
Stock Allocation
↓
Warehouse Picking
↓
Delivery
↓
Invoice
↓
Collection
```

---

# 14. THÔNG TIN SALES ORDER

## Thông tin chung

Số đơn hàng.

Ngày đặt.

Khách hàng.

Nhân viên bán hàng.

Kênh bán hàng.

Địa điểm giao.

Điều khoản thanh toán.

---

## Chi tiết hàng hóa

Mã hàng.

Tên hàng.

Số lượng.

Đơn giá.

Chiết khấu.

Thuế.

Thành tiền.

---

# 15. KIỂM TRA TRƯỚC KHI XÁC NHẬN ĐƠN

Hệ thống kiểm tra:

---

## Tồn kho

Có đủ hàng không.

---

## Công nợ

Khách có quá hạn không.

---

## Hạn mức tín dụng

Có vượt hạn mức không.

---

## Giá bán

Có đúng chính sách không.

---

# 16. GIỮ HÀNG (STOCK RESERVATION)

## Mục tiêu

Đảm bảo hàng cho đơn hàng đã xác nhận.

---

## Trạng thái tồn

Tồn thực tế.

---

Tồn khả dụng.

---

Tồn đã giữ.

---

Tồn đang về.

---

## Cảnh báo

Đơn hàng giữ hàng quá lâu.

---

Hàng giữ nhưng chưa giao.

---

# 17. QUẢN LÝ ĐƠN HÀNG

## Trạng thái

```text
Draft
↓
Pending Approval
↓
Confirmed
↓
Allocated
↓
Picking
↓
Delivered
↓
Invoiced
↓
Paid
↓
Closed
```

---

## Theo dõi

Ngày đặt.

Ngày xác nhận.

Ngày dự kiến giao.

Ngày giao thực tế.

---

# 18. ĐƠN HÀNG GẤP

Đặc thù ngành phụ tùng.

---

Ví dụ:

Khách sửa xe cần hàng trong ngày.

---

ERP hỗ trợ:

* Đánh dấu ưu tiên.
* Đẩy kho xử lý trước.
* Cảnh báo ảnh hưởng đơn khác.

---

# 19. BACKORDER MANAGEMENT

## Mục tiêu

Quản lý đơn hàng thiếu hàng.

---

Ví dụ:

Khách đặt:

100 cái.

Có:

60 cái.

Còn thiếu:

40 cái.

---

Theo dõi:

* Đã giao.
* Chưa giao.
* Ngày dự kiến có hàng.

---

# 20. RETURN SALES

## Quản lý hàng khách trả.

---

Lý do:

* Sai hàng.
* Hàng lỗi.
* Không phù hợp.
* Đổi mẫu.

---

## Quy trình

```text
Return Request
↓
Approval
↓
Receive Return
↓
QC
↓
Refund / Replace
```

---

# 21. CUSTOMER SERVICE

## Quản lý yêu cầu khách hàng

Ví dụ:

* Hỏi hàng.
* Hỏi giá.
* Khiếu nại.
* Yêu cầu hỗ trợ.

---

## Ticket

Thông tin:

Khách hàng.

Nội dung.

Mức độ ưu tiên.

Người xử lý.

SLA.

---

# 22. CẢNH BÁO

## Đơn hàng

* Chưa xử lý.
* Sắp trễ giao.
* Trễ giao.

---

## Khách hàng

* Công nợ quá hạn.
* Giảm doanh số.
* Không phát sinh mua hàng.

---

## Giá bán

* Dưới giá sàn.
* Sai chính sách.

---

## Sales

* Báo giá sắp hết hạn.
* Cơ hội lâu không cập nhật.

---

# 23. DASHBOARD

## Sales Dashboard

Doanh số.

---

Doanh số theo nhân viên.

---

Doanh số theo khu vực.

---

Top sản phẩm bán chạy.

---

Top khách hàng.

---

# Customer Dashboard

Số lượng khách hàng.

---

Khách hàng mới.

---

Khách hàng mất.

---

Tần suất mua hàng.

---

# Order Dashboard

Đơn hàng đang xử lý.

---

Đơn hàng trễ.

---

Đơn hàng thiếu hàng.

---

# Credit Dashboard

Công nợ phải thu.

---

Khách hàng quá hạn.

---

Khách hàng vượt hạn mức.

---

# 24. KPI

## Sales

Doanh thu.

---

Gross Margin.

---

Tỷ lệ hoàn thành kế hoạch.

---

Customer Acquisition.

---

## Customer

Customer Lifetime Value.

---

Repeat Purchase Rate.

---

Customer Retention Rate.

---

## Order

Order Fulfillment Rate.

---

On Time Delivery Rate.

---

Backorder Rate.

---

# 25. TÍCH HỢP

## Inventory

Kiểm tra tồn kho.

Giữ hàng.

Xuất hàng.

---

## Distribution

Chính sách đại lý.

Ký gửi.

---

## Logistics

Giao hàng.

Theo dõi trạng thái giao.

---

## Accounting

Xuất hóa đơn.

Công nợ.

Thu tiền.

---

## Warranty

Lịch sử sản phẩm đã bán.

Bảo hành.

---

## CRM

Khách hàng và lịch sử tương tác.

---

# 26. KIỂM SOÁT QUAN TRỌNG

* Không cho xác nhận đơn khi thiếu thông tin.
* Không cho bán dưới giá sàn nếu chưa duyệt.
* Không cho giao hàng khi vượt hạn mức tín dụng.
* Không cho giao hàng khi công nợ quá hạn (theo cấu hình).
* Không cho giữ hàng vô thời hạn.
* Không cho thay đổi giá sau khi đơn đã duyệt.
* Cảnh báo đơn hàng sắp trễ.
* Cảnh báo khách hàng giảm mua.
* Cảnh báo khách hàng có rủi ro công nợ.

---

# 27. KẾT LUẬN

Phân hệ Sales Order & Customer Management là trung tâm kết nối giữa thị trường và hoạt động vận hành.

Đối với doanh nghiệp phân phối phụ tùng ô tô, hệ thống bán hàng không chỉ quản lý việc "bán hàng" mà phải kiểm soát:

* Bán cho ai.
* Bán sản phẩm gì.
* Giá nào.
* Còn hàng không.
* Có nên cho nợ không.
* Khi nào giao được.
* Đã thu tiền chưa.
* Sản phẩm sau bán có phát sinh bảo hành hay không.

Đây là nền tảng để quản trị doanh thu, lợi nhuận và quan hệ khách hàng dài hạn.
