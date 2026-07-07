# TÀI LIỆU 06 - LOGISTICS & DELIVERY MANAGEMENT

# Quản lý Giao hàng, Vận chuyển và Theo dõi Fulfillment

---

# 1. MỤC TIÊU

Phân hệ Logistics & Delivery Management quản lý toàn bộ quá trình đưa hàng từ kho doanh nghiệp đến khách hàng, đại lý, garage hoặc địa điểm lắp đặt.

Mục tiêu:

* Kiểm soát toàn bộ vòng đời giao hàng.
* Biết chính xác hàng đang ở đâu.
* Theo dõi tiến độ giao hàng theo thời gian thực.
* Giảm giao hàng trễ.
* Kiểm soát chi phí vận chuyển.
* Xác nhận khách hàng đã nhận hàng.
* Quản lý bằng chứng giao hàng (Proof of Delivery - POD).
* Kết nối giữa kho, bán hàng, kế toán và chăm sóc khách hàng.

---

# 2. ĐẶC THÙ GIAO HÀNG PHỤ TÙNG Ô TÔ

Ngành phụ tùng ô tô có đặc thù:

* Nhiều đơn hàng nhỏ.
* Khách hàng cần hàng gấp để sửa chữa xe.
* Có nhiều điểm giao khác nhau.
* Một đơn hàng có thể giao nhiều lần.
* Một khách hàng có thể nhận hàng nhiều địa điểm.
* Cần truy xuất chính xác hàng nào đã giao.

Ví dụ:

Garage A đặt:

```text
Má phanh:
20 bộ

Lọc dầu:
50 cái

ECU:
2 cái
```

Có thể xảy ra:

* Má phanh giao ngay.
* Lọc dầu giao sau.
* ECU chờ hàng về.

ERP phải quản lý được từng dòng hàng.

---

# 3. PHẠM VI QUẢN LÝ

Bao gồm:

* Delivery Request
* Delivery Planning
* Shipment Management
* Vehicle Management
* Driver Management
* Route Planning
* Picking & Packing
* Loading
* Delivery Tracking
* Proof of Delivery
* Delivery Return
* Delivery Cost Management

---

# 4. MÔ HÌNH GIAO HÀNG

```text
Sales Order
      ↓
Delivery Request
      ↓
Warehouse Picking
      ↓
Packing
      ↓
Shipment Planning
      ↓
Loading
      ↓
Delivery
      ↓
Customer Confirmation
      ↓
POD
      ↓
Invoice / Collection
```

---

# 5. DELIVERY REQUEST

## Mục tiêu

Tạo yêu cầu giao hàng từ đơn bán hàng.

---

## Nguồn tạo

* Sales Order.
* Xuất ký gửi.
* Xuất bảo hành.
* Xuất lắp đặt.
* Điều chuyển kho.

---

## Thông tin

Số yêu cầu giao.

Ngày yêu cầu.

Khách hàng.

Địa điểm giao.

Người nhận.

Số điện thoại.

Thời gian yêu cầu.

Mức độ ưu tiên.

---

## Chi tiết hàng hóa

Mã hàng.

Tên hàng.

Số lượng.

Serial.

Lot.

Đơn hàng liên quan.

---

# 6. DELIVERY PLANNING

## Mục tiêu

Lập kế hoạch giao hàng.

---

## Thông tin cần tính toán

Đơn hàng chờ giao.

---

Kho xuất.

---

Địa điểm giao.

---

Khối lượng.

---

Kích thước hàng.

---

Thời gian giao yêu cầu.

---

## Nguyên tắc gom chuyến

Ví dụ:

Cùng:

* Khu vực.
* Tuyến đường.
* Thời gian giao.

Có thể gom nhiều đơn vào một chuyến.

---

# 7. SHIPMENT MANAGEMENT

## Mục tiêu

Quản lý từng chuyến giao hàng.

---

## Thông tin chuyến

Mã chuyến.

Ngày giao.

Kho xuất.

Tài xế.

Xe.

Đơn vị vận chuyển.

---

## Chi tiết

Danh sách đơn hàng.

Danh sách sản phẩm.

Số lượng.

Khách nhận.

---

# 8. TRẠNG THÁI GIAO HÀNG

```text
Draft
↓
Planned
↓
Picking
↓
Packed
↓
Loaded
↓
On Delivery
↓
Arrived
↓
Delivered
↓
Confirmed
↓
Closed
```

---

# 9. PICKING & PACKING

## Mục tiêu

Chuẩn bị hàng trước khi giao.

---

## Picking

Kho lấy hàng.

---

Kiểm tra:

* Mã hàng.
* Số lượng.
* Serial.
* Lot.

---

## Packing

Đóng gói.

---

Thông tin:

* Số kiện.
* Trọng lượng.
* Kích thước.
* Nhãn giao hàng.

---

## Cảnh báo

Lấy sai hàng.

---

Thiếu hàng.

---

Serial không đúng.

---

# 10. QUẢN LÝ XE GIAO HÀNG

## Thông tin xe

Biển số.

Loại xe.

Tải trọng.

Khu vực hoạt động.

Chi phí vận hành.

---

## Trạng thái

Sẵn sàng.

Đang giao.

Bảo trì.

Không sử dụng.

---

## Theo dõi

Số chuyến.

Số km.

Chi phí.

Hiệu suất.

---

# 11. QUẢN LÝ TÀI XẾ

## Thông tin

Họ tên.

Số điện thoại.

Giấy phép lái xe.

Loại bằng.

Ngày hết hạn.

---

## Theo dõi

Số chuyến.

Tỷ lệ giao thành công.

Phản hồi khách hàng.

---

# 12. ĐƠN VỊ VẬN CHUYỂN NGOÀI

## Quản lý

Nhà vận chuyển.

Hợp đồng.

Bảng giá.

Khu vực phục vụ.

SLA.

---

## Theo dõi

Chi phí.

Số chuyến.

Tỷ lệ giao đúng hạn.

---

# 13. DELIVERY TRACKING

## Mục tiêu

Biết hàng đang đi đâu.

---

## Trạng thái chi tiết

```text
Ready
↓
Picked
↓
Loaded
↓
Departed
↓
Arriving
↓
Delivered
```

---

## Thông tin theo dõi

Thời gian xuất kho.

Thời gian bắt đầu giao.

Vị trí hiện tại.

Thời gian dự kiến đến.

Thời gian thực tế đến.

---

# 14. GPS TRACKING

## Nếu tích hợp GPS

Theo dõi:

* Vị trí xe.
* Tuyến đường.
* Thời gian dừng.
* Thời gian giao.

---

## Cảnh báo

Xe đi sai tuyến.

---

Giao chậm.

---

Dừng quá lâu.

---

# 15. PROOF OF DELIVERY (POD)

## Mục tiêu

Xác nhận giao hàng thành công.

---

## Hình thức xác nhận

Chữ ký khách hàng.

---

Ảnh giao hàng.

---

Biên bản giao nhận.

---

OTP xác nhận.

---

GPS location.

---

---

## Thông tin POD

Người nhận.

Thời gian nhận.

Hình ảnh.

Chữ ký.

Ghi chú.

---

# 16. GIAO HÀNG THẤT BẠI

## Trường hợp

Khách không nhận.

---

Sai địa chỉ.

---

Thiếu hàng.

---

Hàng lỗi.

---

Không liên hệ được.

---

## Xử lý

```text
Failed Delivery
↓
Reason Recording
↓
Reschedule
↓
Return Warehouse
```

---

# 17. GIAO THIẾU / GIAO SAI

## Giao thiếu

ERP ghi nhận:

* Đã giao.
* Chưa giao.
* Ngày giao bổ sung.

---

## Giao sai

Tạo:

* Yêu cầu đổi hàng.
* Phiếu thu hồi.
* Phiếu xuất lại.

---

# 18. DELIVERY RETURN

## Mục tiêu

Quản lý hàng quay về sau giao hàng.

---

## Nguyên nhân

* Khách từ chối nhận.
* Sai sản phẩm.
* Hàng lỗi.
* Không giao được.

---

## Quy trình

```text
Return Request
↓
Approve
↓
Pickup
↓
Warehouse Receive
↓
QC
↓
Disposition
```

---

# 19. CHI PHÍ GIAO HÀNG

## Quản lý

Chi phí xe.

---

Nhiên liệu.

---

Phí cầu đường.

---

Thuê vận chuyển ngoài.

---

Bốc xếp.

---

---

## Phân bổ

Theo:

* Chuyến.
* Đơn hàng.
* Khách hàng.

---

# 20. SLA GIAO HÀNG

## Thiết lập

Theo:

* Khu vực.
* Loại khách hàng.
* Loại hàng.

---

Ví dụ:

Nội thành:

Trong 4 giờ.

---

Ngoại tỉnh:

24-48 giờ.

---

Khách VIP:

Ưu tiên.

---

# 21. CẢNH BÁO

## Giao hàng

* Chưa giao đúng hạn.
* Đơn hàng sắp trễ.
* Giao thất bại.

---

## Kho

* Đã có đơn nhưng chưa xuất.
* Đã pick nhưng chưa giao.

---

## Vận chuyển

* Xe chậm.
* Sai tuyến.
* Quá thời gian dự kiến.

---

## Khách hàng

* Chưa xác nhận nhận hàng.
* Chưa ký POD.

---

# 22. DASHBOARD

## Delivery Dashboard

Tổng đơn giao.

---

Đã giao.

---

Đang giao.

---

Trễ giao.

---

Thất bại.

---

---

## Logistics Dashboard

Số chuyến.

---

Chi phí vận chuyển.

---

Hiệu suất xe.

---

Hiệu suất tài xế.

---

---

## Customer Service Dashboard

Đơn chưa giao.

---

Khiếu nại giao hàng.

---

Giao thiếu.

---

---

# 23. KPI

## Delivery

On Time Delivery Rate.

---

Delivery Success Rate.

---

Order Fulfillment Rate.

---

---

## Logistics

Cost per Delivery.

---

Cost per Kilometer.

---

Vehicle Utilization.

---

---

## Warehouse

Picking Accuracy.

---

Packing Accuracy.

---

---

# 24. KIỂM SOÁT QUAN TRỌNG

## Không cho giao

Khi:

* Chưa có phiếu xuất kho.
* Chưa đủ hàng.
* Chưa xác nhận đơn hàng.

---

## Không cho đóng giao hàng

Khi:

* Chưa có POD.
* Chưa xác nhận người nhận.

---

## Cảnh báo

* Đơn hàng quá SLA.
* Hàng đi quá thời gian.
* Giao thiếu.
* Chưa thu hồi hàng trả.

---

# 25. TÍCH HỢP

## Sales Order

Nhận yêu cầu giao hàng.

---

## Inventory

Xuất kho.

Cập nhật tồn.

---

## Distribution

Giao hàng đại lý.

---

## Warranty

Giao hàng thay thế bảo hành.

---

## Accounting

Chi phí vận chuyển.

Doanh thu.

---

## GPS

Theo dõi vị trí.

---

# 26. KẾT LUẬN

Phân hệ Logistics & Delivery Management giúp doanh nghiệp chuyển từ quản lý "đã xuất kho" sang quản lý "đã giao thành công".

Đối với ngành phụ tùng ô tô, đây là phân hệ quan trọng vì:

* Khách hàng cần hàng nhanh để sửa chữa xe.
* Giao chậm ảnh hưởng trực tiếp doanh thu.
* Một đơn hàng có thể chia nhiều lần giao.
* Cần kiểm soát hàng trên đường.
* Cần bằng chứng giao nhận để xử lý công nợ và khiếu nại.

ERP cần đảm bảo doanh nghiệp luôn trả lời được:

* Hàng đang ở đâu?
* Ai đang giữ?
* Bao giờ đến?
* Đã giao cho ai?
* Có xác nhận chưa?
* Có phát sinh vấn đề không?
