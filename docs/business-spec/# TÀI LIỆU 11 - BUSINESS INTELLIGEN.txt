# TÀI LIỆU 11 - BUSINESS INTELLIGENCE, DASHBOARD & MANAGEMENT REPORTING

# Hệ thống Báo cáo Quản trị, Phân tích dữ liệu và Điều hành doanh nghiệp

---

# 1. MỤC TIÊU

Phân hệ Business Intelligence (BI), Dashboard & Management Reporting là lớp phân tích dữ liệu phía trên toàn bộ hệ thống ERP.

Mục tiêu:

* Biến dữ liệu vận hành thành thông tin quản trị.
* Giúp ban lãnh đạo theo dõi tình hình kinh doanh theo thời gian thực.
* Phát hiện sớm rủi ro.
* Hỗ trợ ra quyết định dựa trên dữ liệu.
* Đánh giá hiệu quả từng phòng ban, nhân viên, sản phẩm, đại lý.
* Dự báo nhu cầu hàng hóa.

---

# 2. VAI TRÒ TRONG HỆ THỐNG ERP

Kiến trúc dữ liệu:

```text
                    CEO / Management

                          ↓

              BI Dashboard & Analytics

                          ↓

 -------------------------------------------------

Sales | Inventory | Procurement | Finance | HRM

 |          |            |            |       |

CRM      Warehouse     Import       GL    Payroll

 -------------------------------------------------

                          ↓

                    ERP Database
```

---

# 3. ĐẶC THÙ PHÂN TÍCH DOANH NGHIỆP PHỤ TÙNG Ô TÔ

Doanh nghiệp phân phối phụ tùng có nhiều vấn đề cần phân tích:

* SKU rất lớn.
* Tồn kho chiếm nhiều vốn.
* Giá vốn biến động theo từng lô nhập.
* Nhu cầu phụ thuộc thị trường.
* Đại lý có mức tiêu thụ khác nhau.
* Công nợ ảnh hưởng dòng tiền.
* Dịch vụ bảo hành ảnh hưởng lợi nhuận.

ERP cần trả lời:

* Mặt hàng nào bán chạy?
* Mặt hàng nào tồn kho lâu?
* Đại lý nào hiệu quả?
* Sales nào tạo nhiều lợi nhuận?
* Lô hàng nào có biên lợi nhuận thấp?
* Khi nào cần nhập hàng?
* Chi phí bảo hành tăng ở sản phẩm nào?

---

# 4. PHẠM VI QUẢN LÝ

Bao gồm:

* Executive Dashboard.
* Sales Analytics.
* Inventory Analytics.
* Procurement Analytics.
* Finance Analytics.
* Customer Analytics.
* Service Analytics.
* HR Analytics.
* Predictive Analytics.

---

# 5. EXECUTIVE DASHBOARD

# Dashboard dành cho CEO

---

## 5.1 Tổng quan kinh doanh

Hiển thị:

* Doanh thu hôm nay.
* Doanh thu tháng.
* Doanh thu năm.
* So sánh kế hoạch.
* Tăng trưởng.

---

Ví dụ:

```text
Doanh thu tháng:

Thực tế:
25 tỷ

Kế hoạch:
30 tỷ

Đạt:
83%
```

---

# 6. PROFITABILITY DASHBOARD

## Phân tích lợi nhuận

Theo:

* Toàn công ty.
* Chi nhánh.
* Nhãn hàng.
* Nhóm sản phẩm.
* SKU.
* Đại lý.

---

Chỉ số:

* Revenue.
* Gross Profit.
* Gross Margin.
* Net Profit.

---

Ví dụ:

```text
Sản phẩm:

ECU Toyota

Doanh thu:
5 tỷ

Giá vốn:
3.5 tỷ

Lợi nhuận:
1.5 tỷ

Margin:
30%
```

---

# 7. SALES ANALYTICS

# Phân tích bán hàng

---

## 7.1 Doanh thu

Theo:

* Ngày.
* Tháng.
* Quý.
* Năm.

---

## Theo khách hàng

* Đại lý.
* Garage.
* Doanh nghiệp.

---

## Theo nhân viên

* Sales.
* Sales Team.

---

# 8. SALES PERFORMANCE DASHBOARD

Theo dõi:

* Doanh số mục tiêu.
* Doanh số thực tế.
* Tỷ lệ hoàn thành.
* Số lượng đơn hàng.
* Giá trị trung bình đơn hàng.

---

Ví dụ:

```text
Sales A

Target:
2 tỷ

Actual:
2.4 tỷ

Achievement:
120%
```

---

# 9. PRODUCT ANALYTICS

# Phân tích sản phẩm

---

## Top bán chạy

Theo:

* Số lượng.
* Doanh thu.
* Lợi nhuận.

---

## Sản phẩm chậm bán

Theo:

* Ngày tồn kho.
* Số lần bán.
* Giá trị tồn.

---

# 10. INVENTORY DASHBOARD

# Quản trị tồn kho

---

## Tổng quan

Hiển thị:

* Tổng giá trị tồn kho.
* Số lượng SKU.
* Số kho.
* Xu hướng tồn.

---

# 11. STOCK AGING ANALYSIS

# Phân tích tuổi tồn kho

Ví dụ:

```text
0-90 ngày

90-180 ngày

180-365 ngày

>365 ngày
```

---

## Cảnh báo

Hàng tồn lâu.

Hàng chậm luân chuyển.

Hàng có nguy cơ giảm giá trị.

---

# 12. INVENTORY TURNOVER

## Chỉ số

Vòng quay tồn kho:

```text
Cost of Goods Sold

/

Average Inventory
```

---

Ví dụ:

```text
Vòng quay:

6 lần/năm
```

---

# 13. INVENTORY AVAILABILITY

Theo dõi:

* Hàng có sẵn.
* Hàng đang nhập.
* Hàng thiếu.

---

## Cảnh báo:

Sales Order có nhưng thiếu hàng.

---

# 14. PROCUREMENT DASHBOARD

# Quản lý mua hàng

---

## Theo dõi:

* Giá trị mua.
* Nhà cung cấp.
* Lô hàng đang nhập.
* Lead time.

---

# 15. IMPORT DASHBOARD

# Nhập khẩu ủy thác

---

Theo dõi:

* Số lô đang nhập.
* Giá trị hàng đang trên đường.
* Ngày dự kiến về.
* Lô bị trễ.

---

Ví dụ:

```text
Shipment:

PO-2026-001

ETD:
01/07

ETA:
30/08

Status:
On Vessel
```

---

# 16. LANDED COST ANALYTICS

Phân tích:

* Giá mua.
* Phí ủy thác.
* Thuế.
* Logistics.
* Chi phí nhập khẩu.

---

Mục tiêu:

Biết chính xác:

"1 sản phẩm nhập về kho giá bao nhiêu?"

---

# 17. FINANCE DASHBOARD

# Dashboard CFO

---

## Doanh thu

* Revenue.
* Growth.

---

## Lợi nhuận

* Gross Profit.
* Net Profit.
* Margin.

---

## Dòng tiền

* Cash Balance.
* Cash Flow.

---

# 18. ACCOUNTS RECEIVABLE DASHBOARD

# Công nợ phải thu

---

Theo dõi:

* Tổng công nợ.
* Nợ quá hạn.
* Khách hàng nợ lớn.

---

Aging:

```text
Current

1-30

31-60

61-90

>90
```

---

# 19. ACCOUNTS PAYABLE DASHBOARD

# Công nợ phải trả

Theo dõi:

* Nhà cung cấp.
* Ngày đến hạn.
* Dòng tiền cần thanh toán.

---

# 20. CASH FLOW FORECAST

# Dự báo dòng tiền

Nguồn dữ liệu:

Thu:

* Đơn hàng.
* Công nợ khách hàng.

Chi:

* Nhập hàng.
* Lương.
* Chi phí vận hành.

---

Dự báo:

7 ngày.

30 ngày.

90 ngày.

---

# 21. CUSTOMER ANALYTICS

# Phân tích khách hàng

---

## Đại lý

Theo dõi:

* Doanh số.
* Lợi nhuận.
* Công nợ.
* Tần suất mua.

---

## Customer Ranking

Phân nhóm:

A:

Doanh thu cao.

B:

Ổn định.

C:

Tiềm năng.

D:

Rủi ro.

---

# 22. WARRANTY & SERVICE ANALYTICS

# Phân tích bảo hành dịch vụ

---

Theo dõi:

* Số lượng bảo hành.
* Tỷ lệ lỗi.
* Chi phí bảo hành.
* Thời gian xử lý.

---

Phân tích:

Theo:

* Sản phẩm.
* Nhà cung cấp.
* Đại lý.

---

# 23. FIELD SERVICE DASHBOARD

Theo dõi:

* Số ca dịch vụ.
* Kỹ thuật viên.
* SLA.
* Thời gian xử lý.

---

# 24. HR DASHBOARD

# Phân tích nhân sự

---

Theo dõi:

* Số lượng nhân viên.
* Chi phí nhân sự.
* Tỷ lệ nghỉ việc.
* Năng suất.

---

# 25. KPI DASHBOARD

## Sales KPI

* Revenue.
* Gross Margin.
* New Customer.
* Collection Rate.

---

## Warehouse KPI

* Picking Accuracy.
* Inventory Accuracy.
* Stock Turnover.

---

## Logistics KPI

* On Time Delivery.
* Delivery Success Rate.

---

## Service KPI

* First Time Fix.
* SLA Compliance.

---

# 26. ALERT MANAGEMENT

# Hệ thống cảnh báo chủ động

---

Không chỉ hiển thị báo cáo mà phải tự phát hiện vấn đề.

---

## Inventory Alert

Ví dụ:

```text
SKU ABC

Tồn hiện tại:
50

Nhu cầu dự kiến:
300

=> Cần đặt hàng
```

---

## Finance Alert

Ví dụ:

```text
Khách hàng A

Nợ quá hạn:

500 triệu

=> Cần thu hồi
```

---

## Logistics Alert

Ví dụ:

```text
Đơn hàng:

DL-001

Đã quá SLA:

2 ngày
```

---

## Warranty Alert

Ví dụ:

```text
100 ECU bán ra

Có 15 lỗi

=> Cảnh báo chất lượng
```

---

# 27. MANAGEMENT REPORTING

## Báo cáo ngày

Cho CEO:

* Doanh thu.
* Đơn hàng.
* Giao hàng.
* Thu tiền.
* Sự cố.

---

## Báo cáo tuần

Cho Manager:

* KPI.
* Vấn đề tồn đọng.
* Tiến độ.

---

## Báo cáo tháng

Cho Ban giám đốc:

* Kết quả kinh doanh.
* Lợi nhuận.
* Chi phí.
* Dự báo.

---

# 28. PHÂN QUYỀN DASHBOARD

## CEO

Xem toàn bộ.

---

## CFO

Tài chính.

---

## COO

Vận hành.

---

## Sales Manager

Bán hàng.

---

## Warehouse Manager

Kho.

---

## Service Manager

Bảo hành.

---

# 29. TÍCH HỢP

## ERP Core

Nguồn dữ liệu chính.

---

## BI Tool

Có thể sử dụng:

* Power BI.
* Tableau.
* Looker Studio.

---

## AI Analytics

Có thể bổ sung:

* Dự báo nhu cầu.
* Phát hiện bất thường.
* Gợi ý nhập hàng.
* Phân tích lợi nhuận.

---

# 30. KIẾN TRÚC DỮ LIỆU ĐỀ XUẤT

```text
ERP Transaction Database

          ↓

Data Warehouse

          ↓

ETL / Data Pipeline

          ↓

BI Dashboard

          ↓

Management Decision
```

---

# 31. KIỂM SOÁT QUAN TRỌNG

## Dữ liệu

* Không cho báo cáo sai lệch.
* Đồng bộ dữ liệu theo thời gian.
* Kiểm tra dữ liệu thiếu.

---

## Quyền truy cập

* CEO xem toàn bộ.
* Nhân viên chỉ xem dữ liệu được phép.

---

## Cảnh báo

* Không để dashboard chỉ là báo cáo tĩnh.
* Phải có hành động tiếp theo.

---

# 32. KẾT LUẬN

Phân hệ Business Intelligence là lớp giúp ERP trở thành hệ thống điều hành doanh nghiệp.

Đối với doanh nghiệp phân phối phụ tùng ô tô, giá trị lớn nhất không nằm ở việc lưu dữ liệu mà ở khả năng trả lời nhanh:

* Doanh thu đang tăng hay giảm?
* Lợi nhuận đến từ sản phẩm nào?
* Hàng nào đang chiếm vốn?
* Khi nào cần nhập thêm hàng?
* Đại lý nào đang có rủi ro công nợ?
* Nhà cung cấp nào giao hàng không tốt?
* Chi phí bảo hành đang tăng ở đâu?
* Bộ phận nào đang hoạt động kém hiệu quả?

Một ERP hiện đại cần chuyển từ mô hình:

"Người dùng nhập liệu → xuất báo cáo"

sang:

"Hệ thống tự theo dõi → phát hiện vấn đề → cảnh báo → hỗ trợ quyết định".
