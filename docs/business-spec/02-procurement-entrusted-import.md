# TÀI LIỆU 02 - PROCUREMENT & ENTRUSTED IMPORT MANAGEMENT

# Quản lý Mua hàng và Nhập khẩu Ủy thác

---

# 1. MỤC TIÊU

Phân hệ Procurement & Entrusted Import Management quản lý toàn bộ quá trình từ khi phát sinh nhu cầu mua hàng cho đến khi hàng hóa được nhập kho và sẵn sàng phân phối.

Phân hệ này giúp doanh nghiệp:

* Đảm bảo luôn có đủ hàng để bán.
* Giảm tồn kho dư thừa.
* Kiểm soát tiến độ cung ứng.
* Theo dõi hàng đang về.
* Quản lý đơn vị nhập khẩu ủy thác.
* Kiểm soát giá vốn nhập khẩu.
* Kiểm soát ngân sách mua hàng.
* Hỗ trợ dự báo và lập kế hoạch mua hàng.

---

# 2. PHẠM VI QUẢN LÝ

Bao gồm:

* Dự báo nhu cầu (Forecast)
* Đề nghị mua hàng (Purchase Request)
* Kế hoạch mua hàng
* Báo giá nhà cung cấp
* Đặt hàng (Purchase Order)
* Theo dõi sản xuất
* Theo dõi giao hàng
* Theo dõi nhập khẩu ủy thác
* Theo dõi ETA
* Tiếp nhận hàng hóa
* Kiểm tra chất lượng đầu vào
* Tính giá vốn nhập kho
* Theo dõi công nợ nhà cung cấp

Không bao gồm:

* Hải quan
* Khai báo hải quan
* Nộp thuế nhập khẩu
* Quản lý tờ khai hải quan chi tiết

Những nghiệp vụ này thuộc trách nhiệm của đơn vị nhập khẩu ủy thác.

---

# 3. CÁC BÊN THAM GIA

## Phòng Kế hoạch

Chịu trách nhiệm:

* Dự báo nhu cầu
* Đề xuất mua hàng
* Theo dõi tồn kho

---

## Phòng Mua hàng

Chịu trách nhiệm:

* Làm việc với nhà cung cấp
* Tạo PO
* Theo dõi giao hàng

---

## Phòng Logistics

Chịu trách nhiệm:

* Theo dõi vận chuyển
* Theo dõi ETA
* Phối hợp nhận hàng

---

## Kho

Chịu trách nhiệm:

* Tiếp nhận hàng
* Kiểm đếm
* Nhập kho

---

## QC

Chịu trách nhiệm:

* Kiểm tra chất lượng

---

## Kế toán

Chịu trách nhiệm:

* Công nợ phải trả
* Giá vốn nhập khẩu

---

## Ban Giám Đốc

Chịu trách nhiệm:

* Phê duyệt ngân sách
* Phê duyệt PO giá trị lớn

---

# 4. QUY TRÌNH TỔNG THỂ

```text
Dự báo nhu cầu
↓
Đề nghị mua hàng (PR)
↓
Phê duyệt
↓
Đặt hàng (PO)
↓
Nhà cung cấp xác nhận
↓
Chuẩn bị hàng
↓
Giao đơn vị nhập khẩu ủy thác
↓
Vận chuyển
↓
Hàng về Việt Nam
↓
Giao kho công ty
↓
Kiểm tra chất lượng
↓
Nhập kho
↓
Hoàn tất
```

---

# 5. DEMAND PLANNING

## Mục tiêu

Tính toán nhu cầu nhập hàng trong tương lai.

---

## Nguồn dữ liệu

Doanh số bán hàng.

---

Tồn kho hiện tại.

---

Tồn kho khả dụng.

---

Hàng đang về.

---

Đơn hàng đã xác nhận.

---

Đơn hàng dự báo.

---

## Thông tin cần quản lý

Mã sản phẩm.

---

Tên sản phẩm.

---

Nhóm hàng.

---

Lead Time.

---

Safety Stock.

---

Reorder Point.

---

MOQ.

---

Tồn kho hiện tại.

---

Tồn kho khả dụng.

---

Tồn kho đang giữ cho đơn hàng.

---

Tồn kho đang vận chuyển.

---

## Đề xuất mua tự động

Hệ thống tính toán:

```text
Forecast Demand

-
Available Stock

-
In Transit

=
Required Purchase
```

---

## Cảnh báo

Sắp hết hàng.

---

Tồn kho dưới mức an toàn.

---

Không đủ hàng cho nhu cầu dự báo.

---

Lead Time quá dài.

---

Sản phẩm không phát sinh mua hàng trong thời gian dài.

---

# 6. PURCHASE REQUEST (PR)

## Mục tiêu

Khởi tạo nhu cầu mua hàng.

---

## Thông tin chung

Số PR.

Ngày tạo.

Người tạo.

Phòng ban.

Kho nhận hàng.

Lý do mua.

Mức độ ưu tiên.

---

## Chi tiết hàng hóa

Mã hàng.

Tên hàng.

Đơn vị tính.

Số lượng.

Đơn giá dự kiến.

Thành tiền dự kiến.

Ngày cần hàng.

Ghi chú.

---

## Hệ thống hiển thị

Tồn kho hiện tại.

---

Tồn kho khả dụng.

---

Tồn kho đang về.

---

Forecast.

---

Lần mua gần nhất.

---

Giá mua gần nhất.

---

## Luồng phê duyệt

Người đề xuất

↓

Trưởng bộ phận

↓

Phòng mua hàng

↓

Ban Giám Đốc (nếu vượt hạn mức)

---

## Chặn

Không cho gửi duyệt nếu thiếu dữ liệu bắt buộc.

---

## Cảnh báo

Đề nghị vượt forecast.

---

Đề nghị vượt ngân sách.

---

# 7. PURCHASE ORDER (PO)

## Mục tiêu

Đặt hàng chính thức cho nhà cung cấp.

---

## Thông tin chung

Số PO.

Nhà cung cấp.

Tiền tệ.

Tỷ giá.

Điều khoản thanh toán.

Lead Time.

Ngày giao dự kiến.

Điều kiện giao hàng.

---

## Thông tin hàng hóa

Mã hàng.

Tên hàng.

Số lượng.

Đơn giá.

Chiết khấu.

Thuế.

Tổng giá trị.

---

## Trạng thái PO

```text
Draft
↓
Pending Approval
↓
Approved
↓
Sent Supplier
↓
Supplier Confirmed
↓
Preparing Goods
↓
Shipping
↓
Delivered
↓
Closed
```

---

## Theo dõi thực hiện

Số lượng đặt.

---

Số lượng giao.

---

Số lượng còn lại.

---

Ngày giao dự kiến.

---

Ngày giao thực tế.

---

## Cảnh báo

PO chưa xác nhận.

---

PO sắp đến hạn giao.

---

PO quá hạn.

---

PO giao thiếu.

---

PO giao sai hàng.

---

## Chặn

Không cho sửa PO sau khi duyệt.

---

Không cho hủy PO khi đã nhận hàng.

---

# 8. QUẢN LÝ NHẬP KHẨU ỦY THÁC

## Mục tiêu

Theo dõi toàn bộ lô hàng từ nhà sản xuất đến kho công ty.

---

## Hồ sơ lô hàng

Mã lô hàng.

PO liên quan.

Nhà cung cấp.

Đơn vị nhập khẩu ủy thác.

Forwarder.

ETA.

ETD.

Ngày nhận dự kiến.

Ngày nhận thực tế.

---

## Chứng từ

Commercial Invoice.

Packing List.

Bill of Lading.

Hóa đơn nhập khẩu.

Biên bản bàn giao.

---

## Trạng thái

```text
Waiting Supplier
↓
Ready To Ship
↓
Shipping
↓
Arrived Vietnam
↓
Entrusted Import Processing
↓
Ready Delivery
↓
Warehouse Receiving
↓
Completed
```

---

## Theo dõi

Số lượng đang vận chuyển.

---

Giá trị đang vận chuyển.

---

ETA.

---

Ngày trễ.

---

Số ngày chậm.

---

## Cảnh báo

ETA thay đổi.

---

Lô hàng chậm.

---

Hàng về nhưng chưa giao kho.

---

Thiếu chứng từ.

---

# 9. QUẢN LÝ ĐƠN VỊ NHẬP KHẨU ỦY THÁC

## Thông tin

Mã đơn vị.

Tên đơn vị.

Mã số thuế.

Người liên hệ.

Thông tin hợp đồng.

---

## Theo dõi

Phí ủy thác.

---

Chi phí phát sinh.

---

Số lượng lô hàng.

---

Tỷ lệ đúng hạn.

---

Thời gian xử lý trung bình.

---

## Cảnh báo

Hợp đồng sắp hết hạn.

---

Phí vượt thỏa thuận.

---

Lô hàng xử lý quá hạn.

---

# 10. LANDED COST

## Mục tiêu

Tính giá vốn thực tế khi nhập kho.

---

## Chi phí cần quản lý

Giá mua.

---

Phí ủy thác.

---

Vận chuyển quốc tế.

---

Vận chuyển nội địa.

---

Bốc xếp.

---

Kho bãi.

---

Chi phí phát sinh khác.

---

## Phương pháp phân bổ

Theo giá trị.

---

Theo số lượng.

---

Theo trọng lượng.

---

Theo thể tích.

---

## Kết quả

Giá vốn thực tế từng SKU.

---

Giá vốn từng lô hàng.

---

# 11. RECEIVING

## Mục tiêu

Tiếp nhận hàng hóa.

---

## Đối chiếu

PO.

---

Packing List.

---

Invoice.

---

Biên bản bàn giao.

---

## Kiểm tra

Đúng mã hàng.

---

Đúng số lượng.

---

Đúng quy cách.

---

Đúng serial.

---

Đúng lot.

---

## Kết quả

Nhận đủ.

---

Nhận thiếu.

---

Nhận dư.

---

Sai mã.

---

Hư hỏng.

---

## Tự động sinh

Phiếu nhập kho.

---

Biên bản chênh lệch.

---

Yêu cầu xử lý nhà cung cấp.

---

# 12. QUALITY CONTROL (QC)

## Mục tiêu

Kiểm tra chất lượng đầu vào.

---

## Nội dung kiểm tra

Ngoại quan.

---

Bao bì.

---

Tem nhãn.

---

Serial.

---

Thông số kỹ thuật.

---

Kiểm tra vận hành.

---

## Kết quả

Pass.

---

Reject.

---

Conditional Pass.

---

## Xử lý

Nhập kho.

---

Đưa kho cách ly.

---

Yêu cầu đổi trả.

---

Yêu cầu bồi thường.

---

# 13. CÔNG NỢ NHÀ CUNG CẤP

## Quản lý

Giá trị PO.

---

Giá trị đã nhận.

---

Giá trị đã thanh toán.

---

Giá trị còn phải trả.

---

Ngày đến hạn.

---

Ngày thanh toán.

---

## Cảnh báo

Sắp đến hạn.

---

Quá hạn thanh toán.

---

Vượt hạn mức ngân sách.

---

# 14. DASHBOARD

## Dashboard Mua Hàng

Giá trị mua theo tháng.

---

PO đang mở.

---

PO quá hạn.

---

Giá trị hàng đang về.

---

Giá trị hàng đã nhận.

---

## Dashboard Nhà Cung Cấp

Top nhà cung cấp.

---

Nhà cung cấp giao trễ.

---

Nhà cung cấp giao thiếu.

---

Nhà cung cấp có tỷ lệ lỗi cao.

---

## Dashboard Nhập Khẩu Ủy Thác

Lô hàng đang xử lý.

---

Lô hàng trễ.

---

ETA 30 ngày tới.

---

Chi phí ủy thác.

---

# 15. KPI

## Mua Hàng

Purchase Lead Time.

---

PO Approval Time.

---

PO On Time Rate.

---

Purchase Cost Saving.

---

## Nhà Cung Cấp

OTIF (On Time In Full).

---

Tỷ lệ giao đúng hạn.

---

Tỷ lệ giao đủ hàng.

---

Tỷ lệ hàng lỗi.

---

## Nhập Khẩu Ủy Thác

Thời gian xử lý trung bình.

---

Tỷ lệ giao đúng ETA.

---

Chi phí nhập khẩu trên doanh thu.

---

# 16. TÍCH HỢP

## Inventory

Tạo phiếu nhập kho.

Cập nhật tồn kho.

---

## Warehouse

Sinh nhiệm vụ nhận hàng.

---

## Accounting

Sinh công nợ phải trả.

Sinh bút toán giá vốn.

---

## Workflow

Phê duyệt PR.

Phê duyệt PO.

---

## Dashboard

Cập nhật KPI và báo cáo điều hành.

---

# 17. CÁC KIỂM SOÁT QUAN TRỌNG

* Không cho tạo PO nếu chưa duyệt PR.
* Không cho đặt hàng vượt ngân sách được phê duyệt.
* Không cho nhập kho nếu không có PO hợp lệ.
* Không cho đóng PO khi còn hàng chưa nhận.
* Cảnh báo khi ETA thay đổi.
* Cảnh báo khi lô hàng trễ.
* Cảnh báo khi nhà cung cấp giao thiếu.
* Cảnh báo khi giá vốn thực tế vượt ngưỡng cho phép.
* Cảnh báo khi tồn kho giảm dưới mức an toàn.
* Cảnh báo khi không đủ hàng đáp ứng forecast.
