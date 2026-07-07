# TÀI LIỆU 01 - TỔNG QUAN HỆ THỐNG ERP CHUỖI CUNG ỨNG PHỤ TÙNG Ô TÔ

---

# 1. GIỚI THIỆU

## 1.1 Mục tiêu

Xây dựng hệ thống ERP tích hợp toàn bộ hoạt động doanh nghiệp nhập khẩu và phân phối phụ tùng ô tô.

Hệ thống phải quản lý xuyên suốt từ:

* Dự báo nhu cầu
* Mua hàng
* Nhập khẩu ủy thác
* Kho vận
* Phân phối
* Ký gửi
* Bán hàng
* Giao hàng
* Công nợ
* Bảo hành
* Đổi trả
* Lắp đặt
* Bảo trì
* Kế toán
* Nhân sự
* Điều hành doanh nghiệp

Mục tiêu cuối cùng là tạo ra một hệ thống duy nhất giúp doanh nghiệp biết:

* Hàng đang ở đâu
* Hàng còn bao nhiêu
* Hàng nào sắp hết
* Hàng nào bán chậm
* Khách hàng đang nợ bao nhiêu
* Nhà cung cấp đang giao hàng tới đâu
* Đơn hàng nào đang trễ
* Bảo hành nào đang tồn đọng
* Doanh nghiệp đang lãi hay lỗ

---

# 2. MÔ HÌNH KINH DOANH

## 2.1 Mô hình chuỗi cung ứng

```text
Nhà sản xuất
      ↓
Nhà cung cấp nước ngoài
      ↓
Đơn vị nhập khẩu ủy thác
      ↓
Kho trung tâm
      ↓
─────────────────────────
↓            ↓           ↓
Chi nhánh    Đại lý      Kho ký gửi
↓            ↓           ↓
Garage / Xưởng dịch vụ
↓
Khách hàng cuối
```

---

## 2.2 Đặc thù ngành phụ tùng ô tô

### Chu kỳ cung ứng dài

Thông thường từ:

* 30 ngày
* 60 ngày
* 90 ngày
* 120 ngày

Do đó doanh nghiệp phải dự báo nhu cầu rất sớm.

---

### Một sản phẩm tương thích nhiều dòng xe

Ví dụ:

Má phanh A có thể dùng cho:

* Toyota Camry 2019
* Toyota Camry 2020
* Toyota Camry 2021

---

### Quản lý mã thay thế

Ví dụ:

```text
ABC-001
↓
ABC-002
↓
ABC-003
```

Mã mới thay thế mã cũ.

---

### Quản lý serial

Một số phụ tùng yêu cầu theo dõi serial:

* ECU
* Turbo
* Hộp số
* Máy phát điện

---

### Hàng ký gửi

Hàng đã giao cho đại lý nhưng chưa bán.

Doanh nghiệp vẫn phải quản lý tồn kho.

---

### Hàng bảo hành đổi trả

Nhiều trường hợp:

* Gửi hàng mới trước
* Thu hồi hàng cũ sau

ERP phải theo dõi hàng cũ chưa trả.

---

# 3. PHẠM VI ERP

ERP bao gồm 5 nhóm phân hệ.

---

# 4. NHÓM SUPPLY CHAIN

## Procurement & Entrusted Import

Quản lý:

* Dự báo nhu cầu
* Đề nghị mua hàng
* Đặt hàng
* Theo dõi nhập khẩu ủy thác
* Nhận hàng
* Giá vốn nhập khẩu

---

## Inventory Management

Quản lý:

* Tồn kho
* Lot
* Batch
* Serial
* Hàng đang vận chuyển

---

## Warehouse Management

Quản lý:

* Nhập kho
* Xuất kho
* Điều chuyển kho
* Kiểm kê
* Đóng gói
* Soạn hàng

---

## Distribution Management

Quản lý:

* Đại lý
* Chi nhánh
* Garage
* Showroom

---

## Consignment Management

Quản lý:

* Kho ký gửi
* Hàng đã giao
* Hàng đã bán
* Hàng chưa bán

---

## Logistics & Delivery

Quản lý:

* Giao hàng
* Vận chuyển
* POD
* Theo dõi giao nhận

---

# 5. NHÓM SALES & CUSTOMER

## CRM

Quản lý:

* Khách hàng
* Đại lý
* Garage
* Nhà phân phối

---

## Quotation

Báo giá.

---

## Sales Order

Đơn hàng bán.

---

## Pricing

Bảng giá.

---

## Promotion

Khuyến mãi.

---

## Credit Control

Kiểm soát công nợ.

---

# 6. NHÓM AFTER SALES

## Warranty

Bảo hành.

---

## RMA

Đổi trả.

---

## Core Return

Thu hồi phụ tùng cũ.

---

## Installation

Lắp đặt.

---

## Maintenance

Bảo trì.

---

## Service Ticket

Yêu cầu dịch vụ.

---

# 7. NHÓM TÀI CHÍNH

## General Ledger

Sổ cái.

---

## Account Payable

Công nợ phải trả.

---

## Account Receivable

Công nợ phải thu.

---

## Cash & Bank

Quản lý tiền mặt và ngân hàng.

---

## Fixed Asset

Tài sản cố định.

---

## Costing

Tính giá vốn.

---

## Budget

Ngân sách.

---

# 8. NHÓM QUẢN TRỊ NỘI BỘ

## HRM

Nhân sự.

---

## Time Attendance

Chấm công.

---

## Payroll

Tính lương.

---

## Workflow

Phê duyệt.

---

## Document Management

Quản lý tài liệu.

---

## KPI

Đánh giá hiệu suất.

---

# 9. CẤU TRÚC TỔ CHỨC

## Ban Giám Đốc

Theo dõi:

* Doanh thu
* Lợi nhuận
* Dòng tiền
* Tồn kho

---

## Phòng Kế Hoạch

Theo dõi:

* Nhu cầu
* Forecast

---

## Phòng Mua Hàng

Theo dõi:

* PO
* ETA

---

## Kho

Theo dõi:

* Nhập
* Xuất
* Tồn

---

## Kinh Doanh

Theo dõi:

* Đơn hàng
* Doanh số
* Công nợ

---

## Kỹ Thuật

Theo dõi:

* Bảo hành
* Bảo trì
* Lắp đặt

---

## Kế Toán

Theo dõi:

* AP
* AR
* GL

---

# 10. DỮ LIỆU CHỦ

## Sản phẩm

Thông tin:

* Mã sản phẩm
* Tên sản phẩm
* Nhóm hàng
* Hãng sản xuất
* Xuất xứ

---

## Tương thích xe

* Hãng xe
* Dòng xe
* Năm sản xuất
* Loại động cơ

---

## Nhà cung cấp

* Nhà sản xuất
* Nhà cung cấp

---

## Đơn vị nhập khẩu ủy thác

* Thông tin pháp lý
* Hợp đồng

---

## Đại lý

* Hạn mức tín dụng
* Chính sách giá

---

## Kho

* Kho trung tâm
* Kho chi nhánh
* Kho ký gửi
* Kho bảo hành
* Kho hàng lỗi
* Kho đang vận chuyển

---

# 11. CÁC QUY TẮC KIỂM SOÁT

## Mua hàng

Không cho tạo PO nếu:

* Chưa được duyệt
* Vượt ngân sách

---

## Kho

Không cho:

* Âm kho
* Xuất vượt tồn

---

## Bán hàng

Không cho:

* Giá dưới giá sàn
* Vượt hạn mức tín dụng

---

## Công nợ

Không cho giao hàng nếu:

* Công nợ quá hạn

Cho phép cấu hình:

* Chỉ cảnh báo
* Hoặc chặn hoàn toàn

---

## Bảo hành

Không cho bảo hành tiếp nếu:

* Hàng cũ chưa hoàn trả

Áp dụng:

* ECU
* Turbo
* Hộp số
* Máy phát điện

---

# 12. CÁC CẢNH BÁO QUAN TRỌNG

## Supply Chain

* PO quá hạn
* ETA thay đổi
* Hàng đang về bị chậm

---

## Kho

* Sắp hết hàng
* Hết hàng
* Tồn kho chết
* Tồn kho chậm luân chuyển

---

## Kinh doanh

* Công nợ quá hạn
* Đơn hàng sắp trễ giao

---

## Giao nhận

* Giao trễ
* Chưa xác nhận nhận hàng

---

## Bảo hành

* Ticket quá SLA
* Hàng cũ chưa thu hồi

---

# 13. KPI TOÀN DOANH NGHIỆP

## Mua hàng

* Purchase Lead Time
* Supplier OTIF

---

## Kho

* Inventory Accuracy
* Inventory Turnover

---

## Bán hàng

* Revenue
* Gross Margin

---

## Giao nhận

* On Time Delivery

---

## Bảo hành

* First Time Fix Rate
* Mean Time To Repair

---

## Tài chính

* DSO
* DPO
* Cash Flow

---

# 14. DASHBOARD ĐIỀU HÀNH

## Dashboard CEO

* Doanh thu
* Lợi nhuận
* Dòng tiền
* Công nợ
* Tồn kho
* Hàng đang về
* ETA
* Đơn hàng trễ
* Bảo hành tồn đọng

---

## Dashboard Supply Chain

* Giá trị PO
* Hàng đang vận chuyển
* Forecast
* Tồn kho

---

## Dashboard Sales

* Doanh số
* Đại lý
* Công nợ

---

## Dashboard Warehouse

* Nhập
* Xuất
* Tồn
* Tồn kho chết

---

## Dashboard Service

* Bảo hành
* Bảo trì
* Thu hồi hàng lỗi

---

# 15. DANH SÁCH TÀI LIỆU CHI TIẾT

1. Tổng quan ERP chuỗi cung ứng phụ tùng ô tô

2. Procurement & Entrusted Import Management

3. Inventory & Warehouse Management

4. Distribution & Consignment Management

5. Sales Order & Customer Management

6. Logistics & Delivery Management

7. Warranty, RMA & Field Service Management

8. Finance & Accounting

9. HRM & Payroll

10. BI Dashboard & Control Tower
