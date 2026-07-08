import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Ruler,
  Car,
  Warehouse,
  Building2,
  Network,
  Users,
  IdCard,
  ClipboardCheck,
  Truck,
  FileText,
  ShoppingCart,
  Ship,
  PackageCheck,
  Boxes,
  ScrollText,
  Barcode,
  ArrowLeftRight,
  ClipboardList,
  Store,
  HandCoins,
  Layers,
  ReceiptText,
  Scale,
  Undo2,
  Tag,
  FileSignature,
  ShoppingBag,
  RotateCcw,
  Bus,
  UserRound,
  Building,
  PackageOpen,
  Send,
  ShieldCheck,
  BadgeCheck,
  Undo,
  RefreshCcw,
  Hammer,
  Wrench,
  BookOpen,
  Landmark,
  FileSpreadsheet,
  Receipt,
  Wallet,
  CreditCard,
  Factory,
  PiggyBank,
  LineChart,
  Clock,
  CalendarOff,
  Percent,
  Banknote,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Dữ liệu nền",
    items: [
      { label: "Sản phẩm", href: "/master-data/products", icon: Package },
      { label: "Nhóm hàng", href: "/master-data/categories", icon: Tags },
      { label: "Đơn vị tính", href: "/master-data/uom", icon: Ruler },
      { label: "Xe tương thích", href: "/master-data/vehicle-models", icon: Car },
      { label: "Kho & vị trí", href: "/master-data/warehouses", icon: Warehouse },
    ],
  },
  {
    label: "Tổ chức",
    items: [
      { label: "Chi nhánh", href: "/org/branches", icon: Building2 },
      { label: "Phòng ban", href: "/org/departments", icon: Network },
      { label: "Chức vụ", href: "/org/positions", icon: IdCard },
      { label: "Nhân viên", href: "/org/employees", icon: Users },
    ],
  },
  {
    label: "Mua hàng",
    items: [
      { label: "Nhà cung cấp", href: "/procurement/suppliers", icon: Truck },
      { label: "Đề nghị mua hàng", href: "/procurement/purchase-requests", icon: FileText },
      { label: "Đơn mua hàng", href: "/procurement/purchase-orders", icon: ShoppingCart },
      { label: "Lô hàng nhập khẩu", href: "/procurement/import-shipments", icon: Ship },
      { label: "Phiếu nhập kho", href: "/procurement/goods-receipts", icon: PackageCheck },
    ],
  },
  {
    label: "Kho vận",
    items: [
      { label: "Tồn kho", href: "/inventory/balances", icon: Boxes },
      { label: "Sổ cái tồn kho", href: "/inventory/movements", icon: ScrollText },
      { label: "Serial Number", href: "/inventory/serial-numbers", icon: Barcode },
      { label: "Điều chuyển kho", href: "/inventory/transfers", icon: ArrowLeftRight },
      { label: "Kiểm kê kho", href: "/inventory/counts", icon: ClipboardList },
    ],
  },
  {
    label: "Phân phối & Ký gửi",
    items: [
      { label: "Khách hàng / Đại lý", href: "/distribution/customers", icon: Store },
      { label: "Hợp đồng ký gửi", href: "/distribution/agreements", icon: HandCoins },
      { label: "Ký gửi hàng", href: "/distribution/shipments", icon: Layers },
      { label: "Tồn kho ký gửi", href: "/distribution/balances", icon: Boxes },
      { label: "Báo bán hàng", href: "/distribution/sales-reports", icon: ReceiptText },
      { label: "Đối soát ký gửi", href: "/distribution/reconciliations", icon: Scale },
      { label: "Thu hồi hàng", href: "/distribution/recalls", icon: Undo2 },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      { label: "Bảng giá", href: "/sales/price-lists", icon: Tag },
      { label: "Báo giá", href: "/sales/quotations", icon: FileSignature },
      { label: "Đơn hàng bán", href: "/sales/orders", icon: ShoppingBag },
      { label: "Trả hàng", href: "/sales/returns", icon: RotateCcw },
    ],
  },
  {
    label: "Giao hàng & Vận tải",
    items: [
      { label: "Yêu cầu giao hàng", href: "/logistics/delivery-requests", icon: PackageOpen },
      { label: "Chuyến giao hàng", href: "/logistics/shipments", icon: Send },
      { label: "Xe giao hàng", href: "/logistics/vehicles", icon: Bus },
      { label: "Tài xế", href: "/logistics/drivers", icon: UserRound },
      { label: "Đơn vị vận chuyển", href: "/logistics/carriers", icon: Building },
    ],
  },
  {
    label: "Bảo hành & Dịch vụ",
    items: [
      { label: "Chính sách bảo hành", href: "/warranty/policies", icon: ShieldCheck },
      { label: "Đăng ký bảo hành", href: "/warranty/registrations", icon: BadgeCheck },
      { label: "Yêu cầu bảo hành", href: "/warranty/claims", icon: Undo },
      { label: "RMA - Thu hồi hàng lỗi", href: "/warranty/rma-requests", icon: RefreshCcw },
      { label: "Core Return", href: "/warranty/core-returns", icon: RefreshCcw },
      { label: "Lệnh sửa chữa", href: "/warranty/repair-orders", icon: Hammer },
      { label: "Dịch vụ hiện trường", href: "/warranty/field-service", icon: Wrench },
    ],
  },
  {
    label: "Tài chính & Kế toán",
    items: [
      { label: "Hệ thống tài khoản", href: "/finance/accounts", icon: BookOpen },
      { label: "Trung tâm chi phí", href: "/finance/cost-centers", icon: Factory },
      { label: "Bút toán kế toán (GL)", href: "/finance/journal-entries", icon: FileSpreadsheet },
      { label: "Hóa đơn mua hàng (AP)", href: "/finance/supplier-invoices", icon: Receipt },
      { label: "Hóa đơn bán hàng (AR)", href: "/finance/customer-invoices", icon: Receipt },
      { label: "Thu / Chi", href: "/finance/payments", icon: Wallet },
      { label: "Aging công nợ phải thu", href: "/finance/ar-aging", icon: LineChart },
      { label: "Đánh giá lại tỷ giá", href: "/finance/fx-revaluation", icon: Landmark },
      { label: "Tài khoản ngân hàng", href: "/finance/bank-accounts", icon: CreditCard },
      { label: "Tài sản cố định", href: "/finance/fixed-assets", icon: PiggyBank },
      { label: "Ngân sách", href: "/finance/budgets", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Nhân sự & Lương",
    items: [
      { label: "Hợp đồng lao động", href: "/hrm/contracts", icon: FileText },
      { label: "Ca làm việc", href: "/hrm/shifts", icon: Clock },
      { label: "Chấm công", href: "/hrm/attendance", icon: Clock },
      { label: "Đơn nghỉ phép", href: "/hrm/leave-requests", icon: CalendarOff },
      { label: "Hoa hồng bán hàng", href: "/hrm/commissions", icon: Percent },
      { label: "Bảng lương", href: "/hrm/payroll", icon: Banknote },
    ],
  },
  {
    label: "Phê duyệt",
    items: [{ label: "Hộp thư duyệt", href: "/approvals", icon: ClipboardCheck }],
  },
];
