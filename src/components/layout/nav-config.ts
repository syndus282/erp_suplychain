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
    label: "Phê duyệt",
    items: [{ label: "Hộp thư duyệt", href: "/approvals", icon: ClipboardCheck }],
  },
];
