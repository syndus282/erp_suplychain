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
    label: "Phê duyệt",
    items: [{ label: "Hộp thư duyệt", href: "/approvals", icon: ClipboardCheck }],
  },
];
