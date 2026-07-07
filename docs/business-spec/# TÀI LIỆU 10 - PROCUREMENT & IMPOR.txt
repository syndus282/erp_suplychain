# TÀI LIỆU 10 - PROCUREMENT & IMPORT CONSIGNMENT MANAGEMENT

# Quản lý Mua hàng và Nhập khẩu Ủy thác

---

# 1. MỤC TIÊU

Phân hệ Procurement & Import Consignment Management quản lý toàn bộ quy trình mua hàng và nhập khẩu hàng hóa thông qua hình thức **nhập khẩu ủy thác**.

Phạm vi áp dụng:

* Doanh nghiệp không trực tiếp đứng tên nhập khẩu.
* Có đơn vị nhập khẩu ủy thác thực hiện thủ tục nhập khẩu.
* Hàng hóa là phụ tùng ô tô, linh kiện, thiết bị.
* Sau khi nhập khẩu hoàn tất, hàng được giao về kho doanh nghiệp để phân phối.

Mục tiêu:

* Kiểm soát toàn bộ vòng đời đơn hàng nhập khẩu.
* Theo dõi tiến độ hàng về.
* Quản lý trách nhiệm giữa doanh nghiệp và đơn vị ủy thác.
* Kiểm soát chi phí nhập khẩu.
* Tính đúng giá vốn hàng nhập kho.
* Dự báo thời điểm có hàng.
* Giảm rủi ro thiếu hàng.

---

# 2. ĐẶC THÙ NHẬP KHẨU ỦY THÁC

Khác với nhập khẩu trực tiếp:

Doanh nghiệp:

* Không trực tiếp làm thủ tục hải quan.
* Không đứng tên nhập khẩu.
* Không trực tiếp thanh toán quốc tế (tùy mô hình).
* Thuê đơn vị khác thực hiện.

---

Mô hình:

```text
 id="a81p9x"
Nhà cung cấp nước ngoài

        |

        |

Đơn vị nhập khẩu ủy thác

        |

        |

Doanh nghiệp phân phối

        |

        |

Kho hàng

        |

        |

Đại lý / Khách hàng
```

---

# 3. PHẠM VI QUẢN LÝ

Bao gồm:

* Purchase Request
* Purchase Planning
* Supplier Management
* Import Order
* Import Contract
* Import Shipment Tracking
* Import Document Management
* Customs Tracking
* Import Cost Management
* Warehouse Receiving
* Invoice Matching
* Payment Management

---

# 4. MASTER DATA

# 4.1 Nhà cung cấp nước ngoài

Thông tin:

* Mã nhà cung cấp.
* Tên công ty.
* Quốc gia.
* Địa chỉ.
* Người liên hệ.
* Điều khoản thanh toán.
* Currency.

---

# 4.2 Đơn vị nhập khẩu ủy thác

Thông tin:

* Tên đơn vị.
* Mã số thuế.
* Người phụ trách.
* Hợp đồng ủy thác.
* Phạm vi dịch vụ.

---

## Dịch vụ cung cấp

Ví dụ:

* Khai báo hải quan.
* Thanh toán quốc tế.
* Vận chuyển quốc tế.
* Thông quan.
* Giao hàng nội địa.

---

# 5. QUẢN LÝ HỢP ĐỒNG ỦY THÁC

## Thông tin

Số hợp đồng.

Ngày ký.

Thời hạn.

Đơn vị ủy thác.

Điều khoản.

---

## Phí ủy thác

Có thể tính:

* Theo % giá trị hàng.
* Theo số lượng.
* Theo lô hàng.
* Theo dịch vụ.

---

Ví dụ:

```text
Giá trị hàng nhập:

5 tỷ

Phí ủy thác:

3%

Chi phí ủy thác:

150 triệu
```

---

# 6. PURCHASE REQUEST (YÊU CẦU MUA HÀNG)

## Mục tiêu

Ghi nhận nhu cầu nhập hàng.

---

## Nguồn tạo

* Kế hoạch tồn kho.
* Đơn đặt hàng khách.
* Sales Forecast.
* Bộ phận kinh doanh.
* Bộ phận kho.

---

## Thông tin

Người yêu cầu.

Bộ phận.

Ngày yêu cầu.

Lý do mua.

---

## Chi tiết

Mã hàng.

Tên hàng.

Số lượng.

Thời gian cần.

Nhà cung cấp đề xuất.

---

# 7. PURCHASE APPROVAL

## Quy trình duyệt

Ví dụ:

```text
 id="w6c4se"
Purchase Request

↓

Warehouse Manager

↓

Sales Manager

↓

Finance

↓

Director Approval

↓

Create Import Order
```

---

## Kiểm soát

Không cho tạo đơn nhập nếu:

* Chưa được duyệt.
* Vượt ngân sách.
* Không có lý do.

---

# 8. IMPORT PURCHASE ORDER

# Đơn hàng nhập khẩu

---

## Thông tin chung

Số PO.

Nhà cung cấp.

Đơn vị ủy thác.

Ngày đặt hàng.

Currency.

Điều kiện giao hàng.

---

## Điều kiện thương mại

Ví dụ:

* FOB.
* CIF.
* EXW.

---

## Thanh toán

* T/T.
* L/C.
* Deferred Payment.

---

# 9. CHI TIẾT HÀNG HÓA

Thông tin:

Mã hàng.

Tên hàng.

Part Number.

Số lượng.

Đơn giá ngoại tệ.

Thành tiền.

---

## Theo dõi

Đã đặt.

Đã sản xuất.

Đã giao.

Đã về cảng.

Đã nhập kho.

---

# 10. IMPORT SHIPMENT TRACKING

## Mục tiêu

Theo dõi hành trình hàng hóa.

---

Trạng thái:

```text
 id="8g2m4v"
PO Created

↓

Supplier Confirmed

↓

Production

↓

Ready Shipment

↓

On Vessel

↓

Arrived Port

↓

Custom Clearance

↓

Warehouse Received
```

---

# 11. THEO DÕI TIẾN ĐỘ NHÀ CUNG CẤP

## Thông tin

Ngày cam kết giao.

Ngày thực tế.

Số lượng.

---

## Cảnh báo

Nhà cung cấp giao trễ.

Thiếu hàng.

Sai hàng.

---

# 12. IMPORT DOCUMENT MANAGEMENT

## Quản lý hồ sơ nhập khẩu

Bao gồm:

* Commercial Invoice.
* Packing List.
* Bill of Lading.
* Certificate of Origin.
* Insurance.
* Contract.
* Customs Documents.

---

## Mỗi tài liệu

Có:

* File đính kèm.
* Ngày nhận.
* Người quản lý.
* Trạng thái.

---

# 13. THEO DÕI THÔNG QUAN

## Trạng thái

```text
 id="7z1mqa"
Documents Prepared

↓

Submitted Customs

↓

Inspection

↓

Tax Payment

↓

Released

↓

Completed
```

---

## Theo dõi

Ngày khai báo.

Số tờ khai.

Cửa khẩu.

Thuế.

Tình trạng.

---

# 14. IMPORT COST MANAGEMENT

# Quản lý chi phí nhập khẩu

---

## Chi phí cấu thành

Bao gồm:

## Giá mua

Giá trên Invoice.

---

## Phí ủy thác

Chi phí trả đơn vị nhập khẩu.

---

## Vận chuyển quốc tế

Freight.

---

## Bảo hiểm

Insurance.

---

## Thuế nhập khẩu

Import Tax.

---

## Thuế khác

VAT nhập khẩu.

---

## Chi phí cảng

* THC.
* Handling.
* Storage.

---

## Chi phí nội địa

* Vận chuyển về kho.
* Bốc xếp.
* Kiểm đếm.

---

# 15. LANDING COST CALCULATION

## Mục tiêu

Tính giá vốn thực tế.

---

Công thức:

```text
 id="0kv6f2"
Giá vốn nhập kho

=

Giá mua

+

Phí ủy thác

+

Chi phí nhập khẩu

+

Chi phí vận chuyển

+

Chi phí liên quan
```

---

# 16. PHÂN BỔ CHI PHÍ NHẬP KHẨU

## Phương pháp

### Theo giá trị

Phù hợp hàng có giá trị khác nhau.

---

### Theo số lượng

Phù hợp sản phẩm tương đồng.

---

### Theo trọng lượng

Phù hợp hàng cồng kềnh.

---

### Theo thể tích

Phù hợp vận chuyển container.

---

# 17. RECEIVING IMPORT GOODS

# Nhập kho hàng nhập khẩu

---

## Nguồn

Import PO.

---

## Kiểm tra

* Đúng mã hàng.
* Đúng số lượng.
* Đúng serial.
* Đúng lot.
* Đúng chứng từ.

---

# 18. RECEIVING VARIANCE

## Xử lý sai lệch

Ví dụ:

Đặt:

100 ECU

Nhận:

98 ECU

---

Xử lý:

* Nhập thực tế.
* Ghi nhận thiếu.
* Yêu cầu nhà cung cấp xử lý.

---

# 19. SUPPLIER INVOICE MATCHING

## Đối chiếu

3-Way Matching:

```text
 id="y6c3p0"
Purchase Order

+

Receiving

+

Supplier Invoice
```

---

## Kiểm tra

* Số lượng.
* Đơn giá.
* Tổng tiền.
* Thuế.

---

# 20. PAYMENT MANAGEMENT

## Thanh toán

Đối tượng:

* Nhà cung cấp nước ngoài.
* Đơn vị ủy thác.
* Nhà vận chuyển.
* Nhà cung cấp dịch vụ.

---

## Theo dõi

Đã thanh toán.

Còn phải trả.

Ngày đến hạn.

---

# 21. PURCHASE RETURN

## Trường hợp

* Sai hàng.
* Hàng lỗi.
* Thiếu linh kiện.

---

Quy trình:

```text
Return Request

↓

Approval

↓

Ship Back

↓

Supplier Credit
```

---

# 22. PURCHASE PERFORMANCE

## Đánh giá nhà cung cấp

KPI:

* Giao đúng hạn.
* Tỷ lệ lỗi.
* Tỷ lệ thiếu hàng.
* Giá mua.
* Thời gian phản hồi.

---

# 23. INVENTORY PLANNING

## Kết nối kho

Dữ liệu:

* Tồn hiện tại.
* Safety Stock.
* Forecast.
* Đơn bán chưa giao.
* Lead Time nhập khẩu.

---

## Đề xuất mua

ERP tự cảnh báo:

```text
 id="b4z9tu"
Tồn hiện tại

+

Hàng đang về

<

Mức tồn tối thiểu
```

---

# 24. DASHBOARD

## Import Dashboard

Theo dõi:

* Lô hàng đang nhập.
* Giá trị hàng đang về.
* Ngày dự kiến về.
* Lô hàng trễ.

---

# Purchase Dashboard

* Giá trị mua hàng.
* Nhà cung cấp.
* Chi phí nhập khẩu.
* Xu hướng giá.

---

# Inventory Planning Dashboard

* Hàng sắp hết.
* Hàng cần đặt.
* Hàng tồn lâu.

---

# 25. KPI

## Procurement

Purchase Lead Time.

Supplier On Time Delivery.

Purchase Price Variance.

---

## Import

Import Cycle Time.

Custom Clearance Time.

Landed Cost Accuracy.

---

## Inventory

Stock Availability.

Stock Out Rate.

---

# 26. KIỂM SOÁT QUAN TRỌNG

## Đơn hàng

Không cho đặt mua khi:

* Chưa có phê duyệt.
* Vượt ngân sách.

---

## Nhập kho

Không cho nhập:

* Không có PO.
* Sai mã hàng.
* Sai số lượng vượt ngưỡng.

---

## Chi phí

Không cho đóng lô hàng khi:

* Chưa phân bổ đầy đủ chi phí.

---

## Giá vốn

Không cho thay đổi giá vốn sau khi đã bán.

---

## Cảnh báo

* Lô hàng trễ.
* Nhà cung cấp giao thiếu.
* Chi phí nhập khẩu vượt dự kiến.
* Tồn kho sắp hết.

---

# 27. TÍCH HỢP

## Inventory

Nhập kho.

Tính tồn.

---

## Finance

Công nợ.

Giá vốn.

---

## Sales

Dự báo nhu cầu.

---

## Distribution

Đảm bảo hàng cho đại lý.

---

## Logistics

Theo dõi vận chuyển.

---

# 28. KẾT LUẬN

Phân hệ Procurement & Import Consignment Management là nền tảng quan trọng nhất đối với doanh nghiệp phân phối phụ tùng ô tô nhập khẩu ủy thác.

ERP phải giúp doanh nghiệp trả lời:

* Đang nhập những mặt hàng nào?
* Khi nào hàng về?
* Đang nằm ở đâu trong chuỗi cung ứng?
* Đơn vị ủy thác đã xử lý tới đâu?
* Chi phí thật của một sản phẩm là bao nhiêu?
* Khi nào cần đặt thêm hàng?
* Nhà cung cấp nào đang gây rủi ro?

Khác với mua hàng thông thường, nhập khẩu phụ tùng cần quản lý theo **vòng đời của một lô hàng (Import Shipment Lifecycle)** thay vì chỉ là một Purchase Order.
