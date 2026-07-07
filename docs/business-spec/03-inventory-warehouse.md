# TÀI LIỆU 03 - INVENTORY & WAREHOUSE MANAGEMENT

# Quản lý Tồn kho và Kho vận

---

# 1. MỤC TIÊU

Quản lý toàn bộ hàng hóa của doanh nghiệp từ khi nhập kho đến khi xuất khỏi hệ thống.

Đảm bảo:

* Quản lý chính xác tồn kho.
* Theo dõi vị trí hàng hóa.
* Theo dõi hàng đang vận chuyển.
* Quản lý nhiều kho.
* Quản lý serial, lot, batch.
* Hỗ trợ giao hàng nhanh chóng.
* Hạn chế thất thoát.
* Hỗ trợ tính giá vốn chính xác.
* Kiểm soát hàng bảo hành, hàng lỗi, hàng ký gửi.

---

# 2. PHẠM VI QUẢN LÝ

Bao gồm:

* Quản lý kho
* Quản lý vị trí lưu trữ
* Nhập kho
* Xuất kho
* Điều chuyển kho
* Kiểm kê
* Quản lý serial
* Quản lý lot/batch
* Quản lý hàng đang vận chuyển
* Quản lý hàng ký gửi
* Quản lý hàng bảo hành
* Quản lý hàng lỗi
* Quản lý hàng chờ kiểm tra
* Quản lý tồn kho theo thời gian

---

# 3. CÁC LOẠI KHO

## Kho trung tâm

Lưu trữ hàng chính của doanh nghiệp.

---

## Kho chi nhánh

Kho phục vụ từng khu vực.

---

## Kho ký gửi

Hàng đã giao cho đại lý nhưng vẫn thuộc sở hữu công ty.

---

## Kho bảo hành

Hàng đang xử lý bảo hành.

---

## Kho hàng lỗi

Hàng hư hỏng.

Hàng bị trả về.

Hàng chờ xử lý.

---

## Kho QC

Hàng đang kiểm tra chất lượng.

---

## Kho đang vận chuyển

Hàng đang đi giữa các kho.

Hàng đang giao khách.

---

## Kho kỹ thuật viên

Hàng cấp phát cho kỹ thuật viên đi bảo trì, lắp đặt.

---

## Kho demo

Hàng mẫu.

Hàng trưng bày.

---

# 4. CẤU TRÚC KHO

## Thông tin kho

Mã kho.

Tên kho.

Loại kho.

Địa chỉ.

Người quản lý.

Trạng thái hoạt động.

---

## Khu vực kho

Zone.

---

## Kệ

Rack.

---

## Tầng

Level.

---

## Ô chứa

Bin Location.

---

Ví dụ:

```text id="m64f1t"
Kho HCM
  ↓
Zone A
  ↓
Rack A01
  ↓
Level 03
  ↓
Bin 05
```

---

# 5. DANH MỤC HÀNG HÓA

## Thông tin cơ bản

Mã hàng.

Tên hàng.

Tên quốc tế.

Nhóm hàng.

Đơn vị tính.

Thương hiệu.

Xuất xứ.

---

## Thông tin tồn kho

Safety Stock.

Reorder Point.

MOQ.

Lead Time.

---

## Thông tin quản lý

Có quản lý serial hay không.

Có quản lý lot hay không.

Có quản lý hạn sử dụng hay không.

---

## Đặc thù phụ tùng ô tô

OEM Code.

Part Number.

Supersession Code.

Vehicle Compatibility.

---

Ví dụ:

```text id="n3t4m8"
Brake Pad A

Toyota Camry 2019
Toyota Camry 2020
Toyota Camry 2021
```

---

# 6. QUẢN LÝ SERIAL

Áp dụng:

* ECU
* Turbo
* Hộp số
* Máy phát điện
* Thiết bị điện tử

---

## Thông tin serial

Serial Number.

Ngày nhập.

Kho hiện tại.

Trạng thái.

Khách hàng đang sử dụng.

Thông tin bảo hành.

---

## Truy vết

Nhập từ đâu.

Đang ở kho nào.

Đã bán cho ai.

Đã bảo hành chưa.

Đã thu hồi chưa.

---

# 7. QUẢN LÝ LOT / BATCH

Áp dụng:

* Dầu nhớt
* Hóa chất
* Vật tư tiêu hao

---

## Thông tin

Lot Number.

Batch Number.

Ngày sản xuất.

Hạn sử dụng.

Nhà sản xuất.

---

## Cảnh báo

Sắp hết hạn.

Đã hết hạn.

---

# 8. NHẬP KHO

## Nguồn nhập

Nhập mua hàng.

Nhập điều chuyển.

Nhập trả hàng.

Nhập bảo hành.

Nhập hàng thu hồi.

Nhập kiểm kê.

---

## Thông tin nhập

Ngày nhập.

Kho nhận.

Người nhận.

Nguồn nhập.

Số chứng từ.

---

## Kiểm tra

Đúng mã hàng.

Đúng số lượng.

Đúng serial.

Đúng lot.

---

## Kết quả

Nhập đủ.

Nhập thiếu.

Nhập dư.

Sai hàng.

---

## Cảnh báo

Số lượng khác PO.

Serial không hợp lệ.

---

# 9. XUẤT KHO

## Loại xuất

Xuất bán hàng.

Xuất ký gửi.

Xuất điều chuyển.

Xuất bảo hành.

Xuất lắp đặt.

Xuất nội bộ.

Xuất hủy.

---

## Kiểm tra

Tồn kho.

Serial.

Lot.

Giá bán.

Đơn hàng.

---

## Chặn

Không cho âm kho.

---

Không cho xuất serial không tồn tại.

---

Không cho xuất serial đã bán.

---

Không cho xuất hàng đang bị khóa.

---

# 10. ĐIỀU CHUYỂN KHO

## Trường hợp

Kho trung tâm → Chi nhánh.

Kho trung tâm → Đại lý.

Chi nhánh → Chi nhánh.

Kho → Kỹ thuật viên.

---

## Quy trình

```text id="yr7s0f"
Transfer Request
↓
Approval
↓
Picking
↓
Shipping
↓
Receiving
↓
Completed
```

---

## Trạng thái

Chờ duyệt.

Đang chuẩn bị.

Đang vận chuyển.

Đã nhận.

Hoàn tất.

---

## Cảnh báo

Điều chuyển quá hạn.

Kho nhận chưa xác nhận.

---

# 11. HÀNG ĐANG VẬN CHUYỂN

## Mục tiêu

Biết chính xác hàng đang ở đâu.

---

## Theo dõi

Kho gửi.

Kho nhận.

Ngày gửi.

Ngày dự kiến nhận.

Ngày nhận thực tế.

---

## Trạng thái

Đang vận chuyển.

Đã đến nơi.

Thất lạc.

Hư hỏng.

---

## Dashboard

Giá trị hàng đang vận chuyển.

Số lượng SKU đang vận chuyển.

---

# 12. KIỂM KÊ

## Loại kiểm kê

Toàn bộ kho.

Kiểm kê định kỳ.

Kiểm kê đột xuất.

Kiểm kê theo sản phẩm.

---

## Kết quả

Tồn hệ thống.

Tồn thực tế.

Chênh lệch.

---

## Xử lý

Điều chỉnh tăng.

Điều chỉnh giảm.

Khóa tồn.

Yêu cầu giải trình.

---

## Cảnh báo

Chênh lệch vượt ngưỡng.

---

# 13. QUẢN LÝ HÀNG KÝ GỬI

## Mục tiêu

Theo dõi hàng đã giao đại lý nhưng chưa bán.

---

## Quy trình

```text id="l88xj7"
Kho công ty
↓
Kho ký gửi đại lý
↓
Đại lý bán
↓
Xác nhận bán
↓
Xuất hóa đơn
```

---

## Theo dõi

Ngày giao.

Đại lý.

Số lượng.

Số lượng đã bán.

Số lượng còn lại.

Số ngày tồn.

---

## Cảnh báo

Hàng ký gửi 30 ngày chưa bán.

Hàng ký gửi 60 ngày chưa bán.

Hàng ký gửi 90 ngày chưa bán.

---

# 14. QUẢN LÝ HÀNG BẢO HÀNH

## Trạng thái

Chờ kiểm tra.

Đang kiểm tra.

Đang bảo hành.

Chờ đổi mới.

Đã hoàn tất.

---

## Theo dõi

Serial.

Khách hàng.

Ngày nhận.

Ngày hoàn tất.

---

## Cảnh báo

Quá SLA.

---

# 15. QUẢN LÝ HÀNG THU HỒI

Đặc thù ngành phụ tùng.

---

Ví dụ:

Gửi ECU mới.

↓

Khách phải trả ECU cũ.

---

## Theo dõi

Serial hàng mới.

Serial hàng cũ.

Ngày giao.

Ngày phải hoàn trả.

Ngày hoàn trả thực tế.

---

## Trạng thái

Chờ trả.

Đã trả.

Quá hạn.

Mất hàng.

---

## Cảnh báo

7 ngày chưa trả.

15 ngày chưa trả.

30 ngày chưa trả.

---

## Chặn

Không cho xuất tiếp nếu còn hàng cũ chưa trả.

(Có thể cấu hình)

---

# 16. QUẢN LÝ TỒN KHO

## Tồn kho vật lý

Thực tế trong kho.

---

## Tồn khả dụng

Có thể bán.

---

## Tồn giữ chỗ

Đã giữ cho đơn hàng.

---

## Tồn đang vận chuyển

Đang điều chuyển.

---

## Tồn ký gửi

Đang nằm tại đại lý.

---

## Tồn bảo hành

Đang xử lý bảo hành.

---

# 17. PHƯƠNG PHÁP GIÁ VỐN

Hỗ trợ:

FIFO.

---

Moving Average.

---

Standard Cost.

---

Đề xuất:

Moving Average.

(Phù hợp doanh nghiệp phân phối phụ tùng)

---

# 18. CẢNH BÁO

## Tồn kho

Sắp hết hàng.

Hết hàng.

Tồn dưới Safety Stock.

---

## Hàng hóa

Lot sắp hết hạn.

Serial bất thường.

---

## Ký gửi

Quá thời gian tồn.

---

## Điều chuyển

Quá hạn nhận hàng.

---

## Kiểm kê

Chênh lệch vượt ngưỡng.

---

# 19. DASHBOARD

## Dashboard Kho

Tổng tồn kho.

---

Giá trị tồn kho.

---

Top sản phẩm tồn nhiều.

---

Top sản phẩm sắp hết.

---

## Dashboard Vận hành

Nhập kho.

Xuất kho.

Điều chuyển.

Kiểm kê.

---

## Dashboard Ký gửi

Giá trị ký gửi.

Tồn ký gửi.

Đại lý tồn nhiều nhất.

---

## Dashboard Bảo hành

Hàng đang bảo hành.

Hàng chờ xử lý.

Hàng thu hồi quá hạn.

---

# 20. KPI

## Kho

Inventory Accuracy.

---

Inventory Turnover.

---

Stock Availability.

---

Picking Accuracy.

---

## Ký gửi

Consignment Turnover.

---

Consignment Aging.

---

## Điều chuyển

Transfer Lead Time.

---

Transfer Accuracy.

---

# 21. TÍCH HỢP

## Procurement

Nhận hàng từ PO.

---

## Sales

Xuất hàng bán.

---

## Distribution

Xuất ký gửi.

---

## Warranty

Nhận hàng bảo hành.

---

## Accounting

Giá vốn.

Bút toán kho.

---

## Logistics

Giao nhận.

---

## Dashboard

KPI và báo cáo điều hành.

---

# 22. CÁC KIỂM SOÁT QUAN TRỌNG

* Không cho âm kho.
* Không cho xuất vượt tồn khả dụng.
* Không cho xuất serial không tồn tại.
* Không cho nhập trùng serial.
* Không cho điều chỉnh tồn kho không có phê duyệt.
* Không cho đóng kiểm kê khi chưa xử lý chênh lệch.
* Cảnh báo tồn kho dưới mức an toàn.
* Cảnh báo tồn kho chết.
* Cảnh báo hàng ký gửi lâu ngày chưa bán.
* Cảnh báo hàng thu hồi quá hạn.
* Cảnh báo chênh lệch kiểm kê vượt ngưỡng.
