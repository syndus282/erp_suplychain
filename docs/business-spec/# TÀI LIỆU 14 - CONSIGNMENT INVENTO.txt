# TÀI LIỆU 14 - CONSIGNMENT INVENTORY & DEALER MANAGEMENT

# Quản lý Hàng Ký Gửi, Tồn Kho Đại Lý và Quản lý Mạng lưới Phân phối

---

# 1. MỤC TIÊU

Phân hệ Consignment Inventory & Dealer Management quản lý mô hình phân phối hàng hóa thông qua mạng lưới:

* Đại lý.
* Nhà phân phối cấp dưới.
* Garage.
* Trung tâm dịch vụ.
* Đối tác lắp đặt.

Đặc biệt phù hợp với ngành phụ tùng ô tô, nơi doanh nghiệp thường:

* Gửi hàng trước cho đại lý.
* Cho phép đại lý giữ tồn kho.
* Chỉ ghi nhận doanh thu khi đại lý bán được hàng.
* Theo dõi hàng tồn ngoài hệ thống kho nội bộ.
* Thu hồi hoặc luân chuyển hàng chậm bán.

---

# 2. ĐẶC THÙ HÀNG KÝ GỬI PHỤ TÙNG Ô TÔ

Khác với bán hàng thông thường:

## Bán hàng truyền thống

```text
Kho công ty

↓

Xuất hàng

↓

Khách hàng thanh toán

↓

Kết thúc
```

---

## Hàng ký gửi

```text
Kho công ty

↓

Gửi hàng đến đại lý

↓

Đại lý lưu kho

↓

Đại lý bán cho khách

↓

Đối soát

↓

Xuất hóa đơn / ghi nhận doanh thu

↓

Thu tiền
```

---

# 3. MỤC TIÊU QUẢN LÝ

ERP phải trả lời được:

* Hiện tại hàng của công ty đang nằm ở đâu?
* Đại lý nào đang giữ bao nhiêu hàng?
* Giá trị hàng đang ký gửi là bao nhiêu?
* Hàng nào đã bán?
* Hàng nào tồn lâu?
* Đại lý nào không hiệu quả?
* Khi nào cần thu hồi hàng?
* Đại lý có khai báo đầy đủ doanh số không?

---

# 4. PHẠM VI CHỨC NĂNG

Bao gồm:

* Dealer Master.
* Consignment Agreement.
* Consignment Shipment.
* Dealer Inventory.
* Sales Reporting.
* Inventory Reconciliation.
* Stock Return.
* Stock Transfer.
* Dealer Settlement.
* Commission Management.
* Dealer Performance.

---

# 5. DEALER MASTER MANAGEMENT

# Quản lý đại lý

---

## Thông tin cơ bản

* Mã đại lý.
* Tên đại lý.
* Loại đại lý.
* Địa chỉ.
* Khu vực.
* Người liên hệ.

---

## Phân loại

Ví dụ:

```text
Đại lý cấp 1

↓

Đại lý cấp 2

↓

Garage

↓

Điểm dịch vụ
```

---

# 6. DEALER CLASSIFICATION

Phân loại theo:

## Doanh số

* Platinum.
* Gold.
* Silver.
* Standard.

---

## Khu vực

* Bắc.
* Trung.
* Nam.

---

## Chuyên môn

* Xe tải.
* Xe du lịch.
* Xe công trình.
* Xe chuyên dụng.

---

# 7. CONSIGNMENT AGREEMENT

# Hợp đồng ký gửi

---

Quản lý:

* Số hợp đồng.
* Ngày hiệu lực.
* Đại lý.
* Thời hạn.
* Điều khoản.

---

# 8. ĐIỀU KHOẢN KÝ GỬI

## Chính sách sở hữu

Ví dụ:

Hàng vẫn thuộc sở hữu công ty.

---

## Chính sách thanh toán

Ví dụ:

Đại lý thanh toán sau khi bán.

---

## Chu kỳ đối soát

Ví dụ:

* Hàng ngày.
* Hàng tuần.
* Hàng tháng.

---

# 9. QUY ĐỊNH TỒN KHO

Quản lý:

* Mức tồn tối đa.
* Mức tồn tối thiểu.
* Nhóm hàng được gửi.

---

Ví dụ:

```text
ECU cao cấp

Tồn tối đa:

10 cái

Cần duyệt đặc biệt nếu vượt mức
```

---

# 10. CONSIGNMENT SHIPMENT

# Xuất hàng ký gửi

---

## Nguồn tạo

* Kế hoạch tồn đại lý.
* Yêu cầu đại lý.
* Chương trình mở rộng thị trường.

---

# 11. QUY TRÌNH GỬI HÀNG

```text
Dealer Request

↓

Approval

↓

Warehouse Picking

↓

Delivery

↓

Dealer Receives

↓

Update Consignment Inventory
```

---

# 12. KIỂM SOÁT XUẤT HÀNG KÝ GỬI

Không cho phép:

* Xuất vượt hạn mức.
* Xuất cho đại lý hết hạn hợp đồng.
* Xuất hàng có giá trị cao không duyệt.

---

# 13. DEALER INVENTORY MANAGEMENT

# Tồn kho tại đại lý

---

Hệ thống phải quản lý như một kho ảo.

Ví dụ:

```text
Kho công ty

100 ECU


Dealer A

20 ECU


Dealer B

15 ECU
```

---

# 14. TRẠNG THÁI HÀNG KÝ GỬI

Mỗi sản phẩm có trạng thái:

```text
Available at Company Warehouse

↓

Transferred to Dealer

↓

Dealer Stock

↓

Sold

↓

Returned
```

---

# 15. SERIAL TRACKING

Đối với phụ tùng giá trị cao:

Ví dụ:

* ECU.
* Turbo.
* Hộp số.
* Cụm điện.

Theo dõi:

* Serial nào đang ở đại lý nào.
* Ngày gửi.
* Ngày bán.
* Xe lắp đặt.

---

# 16. DEALER SALES REPORTING

# Báo cáo bán hàng đại lý

---

Đại lý khai báo:

* Số lượng bán.
* Khách hàng cuối.
* Ngày bán.
* Serial.
* Giá bán.

---

Nguồn dữ liệu:

* Portal đại lý.
* Mobile App.
* Import Excel.
* API.

---

# 17. SALES CONFIRMATION

Khi đại lý báo bán:

Hệ thống:

* Giảm tồn ký gửi.
* Ghi nhận doanh số.
* Tạo công nợ.
* Tính hoa hồng.

---

# 18. CONSIGNMENT RECONCILIATION

# Đối soát hàng ký gửi

---

Mục tiêu:

So sánh:

```text
ERP Quantity

vs

Dealer Reported Quantity
```

---

Ví dụ:

ERP:

100 cái

Đại lý báo:

95 cái

Sai lệch:

5 cái

---

# 19. XỬ LÝ SAI LỆCH

Các trường hợp:

## Thiếu hàng

* Điều tra.
* Bồi thường.
* Điều chỉnh.

---

## Chưa báo bán

* Nhắc đại lý.
* Khóa gửi hàng mới.

---

## Sai dữ liệu

* Điều chỉnh sau duyệt.

---

# 20. STOCK RETURN

# Thu hồi hàng ký gửi

---

Lý do:

* Hàng chậm bán.
* Đại lý ngừng hợp tác.
* Thay đổi chính sách.
* Hàng lỗi.

---

Quy trình:

```text
Return Request

↓

Approval

↓

Pickup

↓

Warehouse Receive

↓

Update Inventory
```

---

# 21. STOCK ROTATION

# Luân chuyển hàng giữa đại lý

---

Ví dụ:

Dealer A:

Tồn 20 ECU

Không bán được.

Dealer B:

Thiếu hàng.

---

ERP hỗ trợ:

```text
Dealer A

↓

Central Warehouse

↓

Dealer B
```

hoặc:

```text
Dealer A

↓

Dealer B
```

---

# 22. DEALER REPLENISHMENT

# Bổ sung tồn đại lý

---

ERP đề xuất:

Dựa trên:

* Doanh số lịch sử.
* Tốc độ bán.
* Tồn hiện tại.
* Lead time.

---

Ví dụ:

```text
Bán trung bình:

10/tháng

Tồn hiện tại:

2

Đề xuất gửi:

15
```

---

# 23. DEALER CREDIT MANAGEMENT

# Quản lý công nợ đại lý

---

Theo dõi:

* Hạn mức.
* Dư nợ.
* Tuổi nợ.
* Lịch sử thanh toán.

---

Cảnh báo:

* Vượt hạn mức.
* Nợ quá hạn.
* Không thanh toán đúng kỳ.

---

# 24. DEALER PRICE MANAGEMENT

# Chính sách giá đại lý

---

Theo:

* Cấp đại lý.
* Khu vực.
* Sản lượng.
* Chương trình.

---

Ví dụ:

```text
Dealer Gold

Discount:

15%


Dealer Silver

Discount:

10%
```

---

# 25. DEALER COMMISSION

# Hoa hồng đại lý

---

Có thể tính theo:

* Doanh số.
* Nhóm hàng.
* Chương trình tháng.
* Sản lượng.

---

# 26. DEALER PORTAL

# Cổng thông tin đại lý

---

Chức năng:

## Đặt hàng

* Xem sản phẩm.
* Gửi yêu cầu.

---

## Quản lý tồn

* Xem tồn ký gửi.
* Báo cáo bán.

---

## Hỗ trợ

* Gửi bảo hành.
* Theo dõi xử lý.

---

# 27. MOBILE APP CHO ĐẠI LÝ

Chức năng:

* Quét barcode/QR.
* Kiểm tra tồn.
* Báo bán hàng.
* Tạo yêu cầu bảo hành.
* Nhận thông báo.

---

# 28. DEALER PERFORMANCE DASHBOARD

Theo dõi:

## Doanh số

* Doanh thu.
* Sản lượng.
* Tăng trưởng.

---

## Tồn kho

* Giá trị tồn.
* Tuổi tồn.

---

## Hiệu quả

* Inventory Turnover.
* Sell Through Rate.

---

# 29. SELL THROUGH ANALYSIS

# Tỷ lệ bán ra

Công thức:

```text
Số lượng đã bán

/

Số lượng gửi đại lý
```

---

Ví dụ:

Gửi:

100 cái

Bán:

80 cái

Sell Through:

80%

---

# 30. AGING CONSIGNMENT INVENTORY

# Phân tích tuổi hàng ký gửi

---

Phân loại:

```text
0-90 ngày

90-180 ngày

180-365 ngày

>365 ngày
```

---

Xử lý:

* Khuyến mãi.
* Thu hồi.
* Luân chuyển.

---

# 31. ALERT MANAGEMENT

## Cảnh báo đại lý

Ví dụ:

### Tồn lâu

"Dealer A đang giữ ECU 240 ngày chưa bán"

---

### Không báo cáo

"Dealer B chưa gửi báo cáo bán hàng tháng"

---

### Công nợ

"Dealer C vượt hạn mức"

---

# 32. WORKFLOW TÍCH HỢP

Các quy trình:

* Gửi hàng ký gửi.
* Thu hồi hàng.
* Điều chỉnh tồn.
* Duyệt giá.
* Duyệt chiết khấu.
* Duyệt công nợ.

---

# 33. TÍCH HỢP MODULE

## Inventory

Quản lý tồn.

---

## Sales

Doanh số.

---

## Finance

Công nợ.

---

## Warranty

Bảo hành.

---

## CRM

Quan hệ đại lý.

---

# 34. KPI

## Dealer KPI

* Revenue.
* Growth.
* Sell Through Rate.
* Payment Performance.

---

## Inventory KPI

* Consignment Value.
* Aging Stock.
* Stock Turnover.

---

## Control KPI

* Reconciliation Accuracy.
* Reporting Compliance.

---

# 35. KIỂM SOÁT QUAN TRỌNG

ERP phải đảm bảo:

* Biết chính xác hàng đang nằm ở đại lý nào.
* Không mất kiểm soát hàng ký gửi.
* Không ghi nhận doanh thu sai thời điểm.
* Không cho đại lý giữ hàng quá lâu.
* Kiểm soát công nợ.
* Theo dõi hiệu quả từng đại lý.

---

# 36. KẾT LUẬN

Đối với doanh nghiệp phân phối phụ tùng ô tô, quản lý hàng ký gửi là nghiệp vụ đặc thù và có ảnh hưởng lớn đến:

* Vốn lưu động.
* Rủi ro mất hàng.
* Doanh thu.
* Quan hệ đại lý.

ERP cần quản lý hàng ký gửi như một "mạng lưới kho mở rộng" thay vì chỉ xem là hoạt động bán hàng.

Một hệ thống tốt phải trả lời được:

* Hàng của tôi đang ở đâu?
* Ai đang giữ?
* Đã bán chưa?
* Bao lâu chưa bán?
* Có cần thu hồi không?
* Đại lý nào đang tạo giá trị thực sự?
