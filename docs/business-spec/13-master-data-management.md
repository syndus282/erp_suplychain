# TÀI LIỆU 13 - MASTER DATA MANAGEMENT & SYSTEM ADMINISTRATION

# Quản lý Dữ liệu nền tảng và Quản trị hệ thống ERP

---

# 1. MỤC TIÊU

Phân hệ Master Data Management & System Administration quản lý toàn bộ dữ liệu nền tảng của hệ thống ERP.

Đây là phân hệ quan trọng vì toàn bộ hoạt động:

* Mua hàng.
* Nhập khẩu ủy thác.
* Kho.
* Bán hàng.
* Kế toán.
* Bảo hành.
* Logistics.
* Nhân sự.

đều phụ thuộc vào chất lượng dữ liệu nền.

---

Mục tiêu:

* Chuẩn hóa danh mục dữ liệu.
* Tránh trùng lặp.
* Đảm bảo dữ liệu chính xác.
* Kiểm soát quyền thay đổi dữ liệu.
* Quản lý vòng đời dữ liệu.
* Đảm bảo truy xuất nguồn gốc.

---

# 2. VAI TRÒ TRONG KIẾN TRÚC ERP

```text id="n0u5kp"
                  ERP Transactions

                         ↑

              Master Data Layer

                         ↑

 ------------------------------------------------

Product | Customer | Supplier | Employee | Vehicle

 ------------------------------------------------

                         ↑

              System Administration
```

---

# 3. NGUYÊN TẮC QUẢN LÝ MASTER DATA

## 3.1 Một nguồn dữ liệu duy nhất

Ví dụ:

Một mã phụ tùng chỉ tồn tại một lần.

Không được:

```text id="r8y4hu"
Brake Pad Toyota

TP-001


Má phanh Toyota

BP001
```

cùng tồn tại.

---

## 3.2 Kiểm soát thay đổi

Các dữ liệu quan trọng cần:

* Phê duyệt.
* Lịch sử thay đổi.
* Người thay đổi.

---

## 3.3 Chuẩn hóa mã hóa

Ví dụ:

Part Number.

SKU.

Customer Code.

Supplier Code.

Warehouse Code.

---

# 4. PRODUCT MASTER MANAGEMENT

# Quản lý danh mục phụ tùng

Đây là master data quan trọng nhất của doanh nghiệp.

---

# 5. THÔNG TIN SẢN PHẨM

Bao gồm:

## Thông tin cơ bản

* Mã hàng.
* Tên hàng.
* Tên thương mại.
* Tên kỹ thuật.
* Nhóm hàng.

---

## Thông tin phụ tùng

* Part Number.
* OEM Code.
* Manufacturer Code.
* Model xe tương thích.
* Năm sản xuất xe.
* Xuất xứ.

---

## Phân loại

Ví dụ:

```text id="j0xq49"
Phụ tùng

├── Động cơ

│    ├── Piston

│    ├── Turbo


├── Điện

│    ├── ECU

│    ├── Sensor


├── Gầm

     ├── Phanh

     ├── Giảm xóc
```

---

# 6. PRODUCT ATTRIBUTE MANAGEMENT

Quản lý thuộc tính sản phẩm.

---

Ví dụ:

## ECU

* Điện áp.
* Model xe.
* Firmware.
* Serial.

---

## Lốp xe

* Kích thước.
* Tải trọng.
* Nhà sản xuất.

---

## Dầu nhớt

* Loại dầu.
* Dung tích.
* Tiêu chuẩn.

---

# 7. VEHICLE COMPATIBILITY MASTER

# Quản lý xe tương thích

Đặc thù ngành phụ tùng.

---

Thông tin:

* Hãng xe.
* Model.
* Phiên bản.
* Năm sản xuất.
* Động cơ.
* Loại nhiên liệu.

---

Ví dụ:

```text id="44w8py"
Toyota

Camry

2022

2.5L

↓

Compatible Parts:

ECU-A001

Filter-B002
```

---

# 8. SERIAL & LOT MANAGEMENT

# Quản lý truy xuất nguồn gốc

---

## Serial Tracking

Áp dụng:

* ECU.
* Hộp số.
* Turbo.
* Thiết bị điện tử.

---

Theo dõi:

* Serial nhập.
* Serial xuất.
* Serial bảo hành.
* Serial thay thế.

---

## Lot Tracking

Áp dụng:

* Dầu.
* Hóa chất.
* Linh kiện theo lô.

---

# 9. UNIT OF MEASURE MANAGEMENT

# Quản lý đơn vị tính

Ví dụ:

```text id="9l4n5q"
Cái

Bộ

Thùng

Container

Kg
```

---

Quản lý quy đổi:

```text id="w7m0xs"
1 Thùng

=

20 Cái
```

---

# 10. PRICE MASTER

# Quản lý giá

---

## Loại giá

* Giá mua.
* Giá vốn.
* Giá bán.
* Giá đại lý.
* Giá dự án.

---

## Chính sách giá

Theo:

* Khách hàng.
* Khu vực.
* Số lượng.
* Thời gian.

---

# 11. CUSTOMER MASTER

# Quản lý khách hàng

---

Đối tượng:

* Đại lý.
* Garage.
* Nhà phân phối.
* Khách hàng doanh nghiệp.

---

# 12. THÔNG TIN KHÁCH HÀNG

## Cơ bản

* Mã khách hàng.
* Tên.
* Địa chỉ.
* Liên hệ.
* Mã số thuế.

---

## Kinh doanh

* Kênh bán.
* Nhóm khách hàng.
* Nhân viên phụ trách.
* Khu vực.

---

## Tài chính

* Hạn mức tín dụng.
* Điều khoản thanh toán.
* Công nợ hiện tại.

---

# 13. DEALER MASTER

# Quản lý đại lý

---

Thông tin:

* Cấp đại lý.
* Khu vực.
* Doanh số cam kết.
* Chính sách chiết khấu.

---

Ví dụ:

```text id="m1ps7h"
Level A

Chiết khấu:

15%

Payment Term:

45 ngày
```

---

# 14. SUPPLIER MASTER

# Quản lý nhà cung cấp

---

Bao gồm:

* Nhà cung cấp nước ngoài.
* Đơn vị nhập khẩu ủy thác.
* Nhà vận chuyển.
* Nhà cung cấp dịch vụ.

---

Theo dõi:

* Hợp đồng.
* Điều khoản.
* Lịch sử mua hàng.

---

# 15. WAREHOUSE MASTER

# Quản lý kho

---

Thông tin:

* Mã kho.
* Địa điểm.
* Loại kho.

---

Loại kho:

```text id="7cb4l2"
Kho trung tâm

Kho chi nhánh

Kho bảo hành

Kho hàng lỗi

Kho ký gửi
```

---

# 16. LOCATION MASTER

# Vị trí trong kho

---

Ví dụ:

```text id="f8z2su"
Warehouse A

↓

Zone B

↓

Rack 03

↓

Bin 05
```

---

Quản lý:

* Sức chứa.
* Loại hàng phù hợp.

---

# 17. CONSIGNMENT INVENTORY MASTER

# Quản lý hàng ký gửi

---

Thông tin:

* Chủ sở hữu hàng.
* Đại lý giữ hàng.
* Chính sách bán.
* Chu kỳ đối soát.

---

Theo dõi:

* Hàng gửi.
* Hàng đã bán.
* Hàng còn tồn.

---

# 18. EMPLOYEE MASTER

# Dữ liệu nhân sự

---

Bao gồm:

* Nhân viên.
* Phòng ban.
* Chức vụ.
* Người quản lý.

---

Liên kết:

* Sales.
* Warehouse.
* Service.
* Approval Workflow.

---

# 19. ORGANIZATION STRUCTURE

# Cơ cấu tổ chức

Ví dụ:

```text id="r6sm8a"
Company

|

Branch

|

Department

|

Team

|

Employee
```

---

# 20. SYSTEM USER MANAGEMENT

# Quản lý người dùng

---

Thông tin:

* User Account.
* Nhân viên liên kết.
* Trạng thái.

---

Trạng thái:

* Active.
* Locked.
* Disabled.

---

# 21. ROLE & PERMISSION MANAGEMENT

# Phân quyền

---

Theo:

* Vai trò.
* Chức năng.
* Dữ liệu.

---

Ví dụ:

## Sales

Được:

* Tạo đơn hàng.
* Xem khách hàng phụ trách.

Không được:

* Xem giá vốn.
* Điều chỉnh tồn.

---

## Warehouse

Được:

* Xuất nhập kho.

Không được:

* Sửa giá bán.

---

# 22. DATA SECURITY

## Kiểm soát

* Password Policy.
* MFA.
* Session Control.
* Login History.

---

# 23. AUDIT LOG

Lưu:

* Ai đăng nhập.
* Ai sửa dữ liệu.
* Thay đổi gì.
* Khi nào.

---

Ví dụ:

```text id="4q0v9k"
User A

Changed Product Price

Old:
1,000,000

New:
1,100,000

Date:
07/07/2026
```

---

# 24. DATA QUALITY MANAGEMENT

# Kiểm soát chất lượng dữ liệu

---

Kiểm tra:

* Trùng mã hàng.
* Thiếu thông tin.
* Sai đơn vị tính.
* Sai liên kết.

---

# 25. DATA GOVERNANCE

# Quản trị dữ liệu

---

Quy định:

Ai được tạo.

Ai được sửa.

Ai được duyệt.

Ai chịu trách nhiệm.

---

Ví dụ:

## Product Master

Người tạo:

Product Team

---

Người duyệt:

Product Manager

---

# 26. IMPORT / EXPORT DATA

Hỗ trợ:

* Excel Import.
* API Integration.
* Data Migration.

---

Kiểm tra:

* Duplicate.
* Format.
* Required field.

---

# 27. MASTER DATA WORKFLOW

Ví dụ tạo sản phẩm mới:

```text id="2o7y1n"
Request New Product

↓

Product Team Review

↓

Technical Approval

↓

Finance Setup

↓

Active Product
```

---

# 28. DASHBOARD

## Data Quality Dashboard

Theo dõi:

* SKU thiếu thông tin.
* Khách hàng trùng.
* Dữ liệu chưa duyệt.

---

## User Dashboard

Theo dõi:

* Người dùng.
* Quyền truy cập.
* Hoạt động.

---

# 29. KPI

## Data Quality

Duplicate Rate.

Incomplete Data Rate.

Data Correction Count.

---

## Security

Unauthorized Access.

Failed Login.

Permission Exception.

---

# 30. KIỂM SOÁT QUAN TRỌNG

## Product

* Không tạo SKU trùng.
* Không xóa sản phẩm đã phát sinh giao dịch.
* Kiểm soát thay đổi giá.

---

## Customer

* Không tạo khách hàng trùng.
* Kiểm tra công nợ trước khi cấp hạn mức.

---

## User

* Không cấp quyền vượt chức năng.
* Review quyền định kỳ.

---

# 31. TÍCH HỢP

Kết nối toàn bộ hệ thống:

## Procurement

Product, Supplier.

---

## Inventory

SKU, Warehouse, Location.

---

## Sales

Customer, Price.

---

## Finance

Account Mapping.

---

## HRM

Employee, Organization.

---

## Workflow

Role, Approval Matrix.

---

# 32. KẾT LUẬN

Master Data Management là nền móng của ERP.

Một hệ thống ERP tốt không thể vận hành tốt nếu dữ liệu nền sai.

Đối với doanh nghiệp phân phối phụ tùng ô tô, dữ liệu quan trọng nhất gồm:

* Danh mục phụ tùng.
* Part Number.
* Xe tương thích.
* Serial/Lot.
* Đại lý.
* Chính sách giá.
* Kho.
* Hàng ký gửi.
* Nhà cung cấp.
* Nhân sự.

ERP cần đảm bảo:

"Dữ liệu được tạo đúng ngay từ đầu, được kiểm soát trong suốt vòng đời và phục vụ chính xác cho mọi quyết định kinh doanh."
