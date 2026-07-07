# TÀI LIỆU 07 - WARRANTY, RMA & FIELD SERVICE MANAGEMENT

# Quản lý Bảo hành, Đổi trả, Lắp đặt và Dịch vụ kỹ thuật

---

# 1. MỤC TIÊU

Phân hệ Warranty, RMA & Field Service Management quản lý toàn bộ hoạt động sau bán hàng của doanh nghiệp, bao gồm:

* Tiếp nhận yêu cầu bảo hành.
* Kiểm tra điều kiện bảo hành.
* Xử lý hàng lỗi.
* Đổi mới sản phẩm.
* Thu hồi hàng cũ.
* Quản lý sửa chữa.
* Điều phối kỹ thuật viên.
* Quản lý lắp đặt.
* Quản lý bảo trì.
* Theo dõi chất lượng dịch vụ.

Mục tiêu:

* Rút ngắn thời gian xử lý bảo hành.
* Kiểm soát chi phí bảo hành.
* Truy xuất lịch sử sản phẩm.
* Quản lý trách nhiệm giữa công ty, đại lý và nhà cung cấp.
* Không để thất thoát hàng hóa trong quá trình đổi trả.
* Nâng cao chất lượng dịch vụ khách hàng.

---

# 2. ĐẶC THÙ NGHIỆP VỤ PHỤ TÙNG Ô TÔ

Phụ tùng ô tô có nhiều đặc thù:

* Một sản phẩm có thể cần quản lý serial.
* Thời hạn bảo hành khác nhau theo sản phẩm.
* Có trường hợp phải đổi mới ngay nhưng hàng lỗi trả về sau.
* Có sản phẩm phải gửi về nhà sản xuất để phân tích.
* Có sản phẩm yêu cầu kỹ thuật viên đến tận nơi xử lý.

Ví dụ:

```text id="7hpx6s"
Khách hàng báo lỗi ECU

↓

Công ty gửi ECU mới

↓

Khách trả ECU lỗi

↓

Công ty kiểm tra

↓

Gửi nhà sản xuất hoặc sửa chữa
```

ERP phải theo dõi toàn bộ vòng đời này.

---

# 3. PHẠM VI QUẢN LÝ

Bao gồm:

* Warranty Policy Management
* Warranty Registration
* Warranty Claim
* RMA Management
* Replacement Management
* Core Return Management
* Repair Management
* Field Service Management
* Installation Management
* Maintenance Management
* Service Contract
* Service KPI

---

# 4. MASTER DATA DỊCH VỤ

## 4.1 Sản phẩm bảo hành

Quản lý:

* Mã sản phẩm.
* Nhóm sản phẩm.
* Thời hạn bảo hành.
* Điều kiện bảo hành.
* Chính sách đổi mới.

---

## 4.2 Chính sách bảo hành

Ví dụ:

```text id="1z2x9n"
ECU

Bảo hành:
24 tháng

Điều kiện:
- Có hóa đơn
- Không cháy nổ
- Không can thiệp kỹ thuật
```

---

## 4.3 Loại dịch vụ

* Bảo hành.
* Sửa chữa.
* Bảo trì.
* Lắp đặt.
* Kiểm tra.
* Tư vấn kỹ thuật.

---

# 5. WARRANTY REGISTRATION

## Mục tiêu

Ghi nhận thông tin kích hoạt bảo hành.

---

## Nguồn tạo

* Khi bán hàng.
* Khi lắp đặt.
* Khi khách đăng ký.

---

## Thông tin

Sản phẩm.

Serial.

Ngày bán.

Khách hàng.

Xe sử dụng.

Đại lý bán.

Ngày bắt đầu bảo hành.

Ngày hết hạn.

---

## Liên kết

Sales Order.

Invoice.

Serial.

Customer.

Vehicle.

---

# 6. WARRANTY CLAIM

## Mục tiêu

Tiếp nhận yêu cầu bảo hành.

---

## Quy trình

```text id="g9s0tu"
Customer Complaint
↓
Create Warranty Claim
↓
Warranty Check
↓
Inspection
↓
Approval
↓
Repair / Replace
↓
Complete
```

---

# 7. TẠO YÊU CẦU BẢO HÀNH

## Thông tin chung

Số yêu cầu.

Ngày tạo.

Khách hàng.

Đại lý.

Người liên hệ.

---

## Thông tin sản phẩm

Mã hàng.

Serial.

Ngày mua.

Số hóa đơn.

Xe sử dụng.

---

## Nội dung lỗi

Mô tả lỗi.

Hình ảnh.

Video.

Thông tin kỹ thuật.

---

# 8. KIỂM TRA ĐIỀU KIỆN BẢO HÀNH

Hệ thống tự động kiểm tra:

---

## Thời hạn

Ngày hiện tại <= ngày hết hạn.

---

## Nguồn gốc

Có trong hệ thống bán hàng.

---

## Serial

Serial hợp lệ.

---

## Điều kiện khác

Không bị từ chối bảo hành.

---

## Kết quả

Đủ điều kiện.

---

Không đủ điều kiện.

---

Chờ kiểm tra thêm.

---

# 9. INSPECTION

## Mục tiêu

Xác định nguyên nhân lỗi.

---

## Nội dung

Kiểm tra ngoại quan.

Kiểm tra kỹ thuật.

Kiểm tra serial.

Kiểm tra lịch sử sử dụng.

---

## Kết quả

### Warranty Approved

Chấp nhận bảo hành.

---

### Warranty Rejected

Từ chối.

---

### Need More Investigation

Cần kiểm tra thêm.

---

# 10. RMA - RETURN MATERIAL AUTHORIZATION

## Mục tiêu

Quản lý việc trả hàng lỗi.

---

## Quy trình

```text id="wvx8dj"
RMA Request
↓
Approval
↓
Receive Return
↓
QC Inspection
↓
Repair / Replace / Reject
```

---

# 11. RETURN RECEIVING

## Nhập hàng trả về

Nguồn:

* Khách hàng.
* Đại lý.
* Garage.

---

## Kiểm tra

Mã hàng.

Serial.

Tình trạng.

Phụ kiện đi kèm.

---

## Kết quả

Đưa vào:

* Kho bảo hành.
* Kho hàng lỗi.
* Kho sửa chữa.

---

# 12. REPLACEMENT MANAGEMENT

## Mục tiêu

Quản lý đổi hàng mới.

---

Ví dụ:

```text id="v7qf12"
Khách trả:

ECU lỗi

↓

Công ty xuất:

ECU mới
```

---

## Theo dõi

Hàng mới xuất.

Hàng lỗi chưa trả.

Ngày phải trả.

---

## Cảnh báo

Đã gửi hàng mới nhưng chưa nhận hàng lỗi.

---

# 13. CORE RETURN MANAGEMENT

## Mục tiêu

Quản lý hàng cũ phải thu hồi.

Áp dụng:

* ECU.
* Turbo.
* Hộp số.
* Máy phát điện.
* Máy nén.

---

## Quy trình

```text id="9p4vhr"
New Item Delivered
↓
Old Item Pending Return
↓
Customer Returns Core
↓
Inspection
↓
Supplier Return
↓
Closed
```

---

## Theo dõi

Serial hàng mới.

Serial hàng cũ.

Khách hàng.

Ngày giao.

Ngày phải trả.

Ngày thực trả.

---

## Trạng thái

Chờ trả.

Đã nhận.

Quá hạn.

Mất.

Không đạt.

---

## Cảnh báo

Sau 7 ngày.

Sau 15 ngày.

Sau 30 ngày.

---

## Chặn

Có thể cấu hình:

Không cho tiếp tục cấp hàng mới nếu khách chưa hoàn trả core cũ.

---

# 14. REPAIR MANAGEMENT

## Mục tiêu

Quản lý sửa chữa sản phẩm lỗi.

---

## Trạng thái

```text id="z0v1v3"
Received
↓
Inspection
↓
Diagnosis
↓
Repairing
↓
Testing
↓
Completed
↓
Returned
```

---

## Theo dõi

Kỹ thuật viên.

Linh kiện thay thế.

Thời gian sửa.

Chi phí sửa.

---

# 15. FIELD SERVICE MANAGEMENT

## Mục tiêu

Điều phối kỹ thuật viên đến khách hàng.

---

## Trường hợp sử dụng

* Lắp đặt phụ tùng.
* Kiểm tra lỗi.
* Bảo trì.
* Hỗ trợ kỹ thuật.

---

# 16. SERVICE REQUEST

## Thông tin

Khách hàng.

Địa điểm.

Loại dịch vụ.

Mức độ ưu tiên.

Thời gian yêu cầu.

---

# 17. ĐIỀU PHỐI KỸ THUẬT VIÊN

## Thông tin kỹ thuật viên

Nhân viên.

Kỹ năng.

Khu vực phụ trách.

Lịch làm việc.

---

## Nguyên tắc phân công

Theo:

* Khoảng cách.
* Kỹ năng.
* Lịch rảnh.
* Mức độ ưu tiên.

---

# 18. QUY TRÌNH DỊCH VỤ

```text id="u3z0e4"
Service Request
↓
Assign Technician
↓
Travel
↓
Work Started
↓
Diagnosis
↓
Repair / Install
↓
Customer Acceptance
↓
Close
```

---

# 19. MOBILE APP CHO KỸ THUẬT VIÊN

Có thể hỗ trợ:

* Nhận việc.
* Xem lịch.
* Xem địa điểm.
* Check-in GPS.
* Chụp ảnh.
* Ghi nhận lỗi.
* Nhập vật tư sử dụng.
* Lấy chữ ký khách hàng.

---

# 20. INSTALLATION MANAGEMENT

## Mục tiêu

Quản lý lắp đặt sản phẩm.

---

## Thông tin

Thiết bị.

Khách hàng.

Địa điểm.

Kỹ thuật viên.

Ngày lắp.

---

## Checklist

Kiểm tra trước lắp.

Lắp đặt.

Chạy thử.

Bàn giao.

---

# 21. MAINTENANCE MANAGEMENT

## Mục tiêu

Quản lý bảo trì định kỳ.

---

## Thông tin

Thiết bị.

Chu kỳ bảo trì.

Ngày bảo trì kế tiếp.

Lịch sử bảo trì.

---

## Cảnh báo

Sắp đến hạn bảo trì.

Quá hạn bảo trì.

---

# 22. SLA MANAGEMENT

## Thiết lập

Theo:

* Loại khách hàng.
* Loại sản phẩm.
* Mức độ lỗi.

---

Ví dụ:

VIP:

Phản hồi trong 2 giờ.

---

Bình thường:

24 giờ.

---

# 23. WARRANTY COST MANAGEMENT

## Theo dõi chi phí

Chi phí linh kiện.

---

Chi phí nhân công.

---

Chi phí vận chuyển.

---

Chi phí kỹ thuật.

---

Chi phí đổi mới.

---

## Phân tích

Theo:

* Sản phẩm.
* Nhà cung cấp.
* Đại lý.
* Nguyên nhân lỗi.

---

# 24. DASHBOARD

## Warranty Dashboard

Số lượng yêu cầu.

---

Đang xử lý.

---

Quá SLA.

---

Chi phí bảo hành.

---

Top sản phẩm lỗi.

---

# RMA Dashboard

Hàng trả về.

---

Hàng chờ xử lý.

---

Tỷ lệ lỗi.

---

# Service Dashboard

Lịch kỹ thuật viên.

---

Số ca hoàn thành.

---

Thời gian xử lý trung bình.

---

# 25. KPI

## Warranty

Warranty Claim Rate.

---

Warranty Cost Ratio.

---

Average Resolution Time.

---

First Time Fix Rate.

---

## Service

Service Response Time.

---

Service Completion Rate.

---

Technician Utilization.

---

## Quality

Failure Rate.

---

Repeat Failure Rate.

---

# 26. KIỂM SOÁT QUAN TRỌNG

* Không bảo hành khi hết hạn.
* Không bảo hành serial không tồn tại.
* Không đổi mới nếu chưa có phê duyệt.
* Không xuất hàng mới nếu yêu cầu core return chưa được kiểm soát (theo cấu hình).
* Không đóng ticket khi chưa có biên bản nghiệm thu.
* Không sử dụng linh kiện vượt định mức nếu chưa duyệt.
* Cảnh báo bảo hành quá SLA.
* Cảnh báo hàng cũ chưa thu hồi.
* Cảnh báo sản phẩm có tỷ lệ lỗi cao.

---

# 27. TÍCH HỢP

## Sales Order

Lấy thông tin sản phẩm đã bán.

---

## Inventory

Nhập hàng lỗi.

Xuất hàng thay thế.

---

## Distribution

Quản lý bảo hành qua đại lý.

---

## Procurement

Theo dõi trả hàng nhà cung cấp.

---

## Accounting

Chi phí bảo hành.

---

## HRM

Điều phối nhân viên kỹ thuật.

---

# 28. KẾT LUẬN

Phân hệ Warranty, RMA & Field Service Management giúp doanh nghiệp quản lý toàn bộ vòng đời sau bán hàng.

Đối với ngành phụ tùng ô tô, đây là phân hệ tạo khác biệt lớn vì không chỉ xử lý "bảo hành", mà còn phải quản lý:

* Hàng mới đã gửi đi.
* Hàng cũ chưa thu hồi.
* Trách nhiệm giữa khách hàng, đại lý, công ty và nhà sản xuất.
* Chi phí bảo hành.
* Chất lượng sản phẩm.
* Hiệu quả đội kỹ thuật.

Một ERP tốt phải biến hoạt động bảo hành từ xử lý thủ công thành một quy trình có kiểm soát, đo lường được và tối ưu liên tục.
