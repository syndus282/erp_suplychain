# TÀI LIỆU 12 - WORKFLOW, APPROVAL & INTERNAL CONTROL MANAGEMENT

# Quản lý Quy trình Phê duyệt, Luồng công việc và Kiểm soát nội bộ

---

# 1. MỤC TIÊU

Phân hệ Workflow, Approval & Internal Control Management là lớp kiểm soát xuyên suốt toàn bộ hệ thống ERP.

Mục tiêu:

* Chuẩn hóa quy trình vận hành.
* Đảm bảo giao dịch đúng thẩm quyền.
* Kiểm soát rủi ro gian lận.
* Hạn chế sai sót nhập liệu.
* Minh bạch trách nhiệm từng cá nhân.
* Theo dõi tiến độ xử lý công việc.
* Tạo lịch sử phê duyệt đầy đủ.

Đối với doanh nghiệp phân phối phụ tùng ô tô, phân hệ này đặc biệt quan trọng vì có nhiều nghiệp vụ liên quan đến:

* Giá trị hàng tồn kho lớn.
* Nhiều đại lý.
* Nhiều giao dịch xuất nhập hàng.
* Công nợ lớn.
* Chi phí nhập khẩu cao.
* Chính sách giá, chiết khấu phức tạp.

---

# 2. VAI TRÒ TRONG KIẾN TRÚC ERP

Workflow là lớp điều phối giữa các module.

```text
                  User Request

                       ↓

              Workflow Engine

                       ↓

 ------------------------------------------------

 Procurement | Sales | Inventory | Finance | HRM

 ------------------------------------------------

                       ↓

              Approval History

                       ↓

              Transaction Posted
```

---

# 3. NGUYÊN TẮC THIẾT KẾ WORKFLOW

## 3.1 Không chỉ là duyệt

Workflow phải quản lý:

* Ai tạo.
* Ai kiểm tra.
* Ai phê duyệt.
* Ai thực hiện.
* Ai chịu trách nhiệm cuối cùng.

---

## 3.2 Theo giá trị giao dịch

Ví dụ:

Đơn mua hàng:

```text
<100 triệu

Sales Manager duyệt


100 triệu - 1 tỷ

Director duyệt


>1 tỷ

Board Approval
```

---

## 3.3 Theo vai trò

Không phụ thuộc cá nhân.

Ví dụ:

```text
Warehouse Manager

thay vì:

Nguyễn Văn A
```

Khi thay đổi nhân sự, workflow không bị lỗi.

---

# 4. WORKFLOW ENGINE

## Thành phần

Bao gồm:

* Workflow Designer.
* Rule Engine.
* Approval Matrix.
* Notification Engine.
* Escalation Engine.
* Audit Trail.

---

# 5. WORKFLOW DESIGNER

## Mục tiêu

Cho phép thiết kế quy trình mà không cần lập trình.

---

Ví dụ:

```text
Create Request

↓

Check Condition

↓

Assign Approver

↓

Approve / Reject

↓

Complete Transaction
```

---

# 6. APPROVAL MATRIX

# Ma trận phê duyệt

---

Quyết định dựa trên:

* Loại nghiệp vụ.
* Số tiền.
* Bộ phận.
* Chi nhánh.
* Nhóm hàng.
* Mức độ rủi ro.

---

Ví dụ:

## Mua hàng

| Giá trị      | Người duyệt        |
| ------------ | ------------------ |
| <50 triệu    | Trưởng bộ phận     |
| 50-500 triệu | Giám đốc phòng ban |
| >500 triệu   | Ban giám đốc       |

---

# 7. CÁC WORKFLOW QUAN TRỌNG

---

# PHẦN A

# PROCUREMENT WORKFLOW

---

# 8. PURCHASE REQUEST APPROVAL

## Quy trình

```text
Purchase Request

↓

Department Manager

↓

Procurement

↓

Finance Check Budget

↓

Director Approval

↓

Create PO
```

---

## Kiểm soát

Không cho tạo PO nếu:

* PR chưa duyệt.
* Không đủ ngân sách.
* Thiếu thông tin hàng hóa.

---

# 9. PURCHASE ORDER APPROVAL

## Điều kiện duyệt

Theo:

* Giá trị PO.
* Nhà cung cấp.
* Loại hàng.

---

## Cảnh báo

* Giá mua cao hơn lịch sử.
* Nhà cung cấp mới.
* Đơn hàng vượt kế hoạch.

---

# 10. IMPORT COST APPROVAL

Áp dụng cho nhập khẩu ủy thác.

---

Cần duyệt:

* Phí ủy thác.
* Chi phí phát sinh.
* Chi phí vượt dự toán.

---

Ví dụ:

```text
Dự toán nhập khẩu:

500 triệu

Thực tế:

650 triệu

↓

Cần giải trình
```

---

# PHẦN B

# SALES WORKFLOW

---

# 11. SALES ORDER APPROVAL

## Áp dụng khi:

* Giảm giá.
* Vượt hạn mức tín dụng.
* Đơn hàng lớn.

---

Quy trình:

```text
Sales Create Order

↓

Check Price Policy

↓

Check Credit Limit

↓

Approve

↓

Release Delivery
```

---

# 12. DISCOUNT APPROVAL

## Kiểm soát giá bán

Ví dụ:

```text
Chiết khấu <=5%

Sales Manager


5%-15%

Director


>15%

CEO
```

---

# 13. CREDIT LIMIT APPROVAL

## Kiểm soát công nợ

Ví dụ:

Khách hàng:

Hạn mức:
2 tỷ

Đang nợ:
1.8 tỷ

Đơn mới:
500 triệu

=> Vượt hạn mức.

---

Xử lý:

* Chặn giao hàng.
* Yêu cầu duyệt đặc biệt.

---

# PHẦN C

# INVENTORY WORKFLOW

---

# 14. STOCK ADJUSTMENT APPROVAL

Áp dụng:

* Điều chỉnh tăng kho.
* Điều chỉnh giảm kho.
* Xử lý mất hàng.

---

Quy trình:

```text
Adjustment Request

↓

Warehouse Check

↓

Accounting Review

↓

Approval

↓

Post Transaction
```

---

# 15. INVENTORY TRANSFER APPROVAL

Điều chuyển kho.

---

Kiểm soát:

* Kho nguồn.
* Kho nhận.
* Số lượng.
* Giá trị hàng.

---

# 16. STOCK WRITE-OFF APPROVAL

Xử lý:

* Hàng hỏng.
* Hàng mất.
* Hàng lỗi thời.

---

Yêu cầu:

* Lý do.
* Hình ảnh.
* Biên bản.

---

# PHẦN D

# WARRANTY WORKFLOW

---

# 17. WARRANTY CLAIM APPROVAL

Quy trình:

```text
Customer Claim

↓

Warranty Inspection

↓

Warranty Manager Review

↓

Approve

↓

Repair / Replace
```

---

# 18. FREE REPLACEMENT APPROVAL

Kiểm soát:

* Giá trị hàng thay thế.
* Nguyên nhân lỗi.
* Trách nhiệm.

---

Ví dụ:

ECU:

30 triệu

=> Cần quản lý cấp cao duyệt.

---

# PHẦN E

# FINANCE WORKFLOW

---

# 19. PAYMENT REQUEST APPROVAL

Quy trình:

```text
Payment Request

↓

Department Confirm

↓

Finance Check

↓

Manager Approval

↓

Payment
```

---

# 20. EXPENSE CLAIM APPROVAL

Áp dụng:

* Công tác phí.
* Chi phí vận chuyển.
* Chi phí dịch vụ.

---

Kiểm soát:

* Hóa đơn.
* Chứng từ.
* Hạn mức.

---

# 21. JOURNAL ENTRY APPROVAL

Áp dụng:

* Bút toán điều chỉnh.
* Cuối kỳ.
* Điều chỉnh giá vốn.

---

Yêu cầu:

* Lý do.
* Người duyệt.
* Audit trail.

---

# PHẦN F

# HR WORKFLOW

---

# 22. LEAVE APPROVAL

Quy trình:

```text
Employee Request

↓

Manager Approval

↓

HR Update
```

---

# 23. OVERTIME APPROVAL

Kiểm soát:

* Người đăng ký.
* Số giờ.
* Chi phí phát sinh.

---

# 24. SALARY CHANGE APPROVAL

Áp dụng:

* Tăng lương.
* Điều chỉnh phụ cấp.
* Thưởng đặc biệt.

---

# PHẦN G

# DELIVERY WORKFLOW

---

# 25. DELIVERY EXCEPTION APPROVAL

Trường hợp:

* Giao ngoài kế hoạch.
* Giao thiếu.
* Giao lại.

---

# 26. RETURN DELIVERY APPROVAL

Kiểm soát:

* Lý do trả hàng.
* Tình trạng hàng.
* Xử lý tồn kho.

---

# 27. NOTIFICATION ENGINE

## Kênh thông báo

* ERP Notification.
* Email.
* Mobile App.
* SMS.
* Microsoft Teams/Zalo OA (nếu tích hợp).

---

Ví dụ:

"Bạn có 3 yêu cầu đang chờ duyệt"

---

# 28. ESCALATION MANAGEMENT

# Cơ chế nhắc việc

---

Ví dụ:

Workflow:

Duyệt trong 24 giờ.

Sau 24 giờ:

Gửi nhắc.

---

Sau 48 giờ:

Gửi cấp trên.

---

Sau 72 giờ:

Cảnh báo quản lý.

---

# 29. TASK MANAGEMENT

Mỗi workflow tạo ra task.

---

Thông tin:

* Người xử lý.
* Hạn xử lý.
* Mức ưu tiên.
* Trạng thái.

---

Trạng thái:

```text
New

↓

In Progress

↓

Completed

↓

Rejected
```

---

# 30. AUDIT TRAIL

# Lịch sử thao tác

Lưu:

* Ai tạo.
* Ai sửa.
* Ai duyệt.
* Thời gian.
* Giá trị trước/sau.

---

Ví dụ:

```text
User A

Changed Discount

5%

↓

10%

Approved by Manager B
```

---

# 31. INTERNAL CONTROL

## Kiểm soát phân quyền

Ví dụ:

Người tạo PO:

Không được tự duyệt PO.

---

Người nhập kho:

Không được tự điều chỉnh tồn.

---

Người bán hàng:

Không được tự giảm giá vượt quyền.

---

# 32. SEGREGATION OF DUTIES (SOD)

# Phân tách nhiệm vụ

Nguyên tắc:

Một người không được kiểm soát toàn bộ vòng đời giao dịch.

---

Ví dụ:

Sai:

```text
Sales tạo đơn

↓

Sales duyệt

↓

Sales xuất hàng
```

---

Đúng:

```text
Sales tạo đơn

↓

Manager duyệt

↓

Warehouse xuất
```

---

# 33. DASHBOARD WORKFLOW

## Management Dashboard

Theo dõi:

* Yêu cầu chờ duyệt.
* Công việc quá hạn.
* Người xử lý chậm.
* Giá trị giao dịch đang chờ.

---

Ví dụ:

```text
Pending Approval:

Payment:
15

PO:
8

Warranty:
12

Total Value:
8.5 tỷ
```

---

# 34. KPI

## Workflow

Approval Time.

Average Processing Time.

Pending Task.

Overdue Rate.

---

## Control

Unauthorized Transaction.

Exception Count.

Audit Finding.

---

# 35. KIỂM SOÁT QUAN TRỌNG

Hệ thống phải có khả năng:

* Chặn giao dịch chưa duyệt.
* Chặn vượt quyền.
* Cảnh báo giao dịch bất thường.
* Lưu toàn bộ lịch sử.
* Không cho xóa dữ liệu quan trọng.
* Theo dõi trách nhiệm cá nhân.

---

# 36. TÍCH HỢP

## Tất cả module ERP

Workflow phải kết nối:

* Procurement.
* Sales.
* Inventory.
* Finance.
* HRM.
* Warranty.
* Logistics.

---

# 37. KẾT LUẬN

Workflow & Internal Control là lớp "hệ thần kinh điều hành" của ERP.

Đối với doanh nghiệp phân phối phụ tùng ô tô, hệ thống không chỉ cần quản lý dữ liệu mà phải kiểm soát cách doanh nghiệp vận hành.

ERP cần đảm bảo:

* Không mua hàng sai quy trình.
* Không xuất hàng khi chưa đủ điều kiện.
* Không bán vượt rủi ro công nợ.
* Không thất thoát hàng bảo hành.
* Không chi tiền không kiểm soát.
* Không thay đổi dữ liệu mà không có dấu vết.

Một ERP trưởng thành không chỉ giúp doanh nghiệp làm việc nhanh hơn mà còn giúp doanh nghiệp vận hành an toàn hơn.
