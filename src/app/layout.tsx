import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Chuỗi Cung Ứng Phụ Tùng Ô Tô",
  description: "ERP nội bộ quản lý chuỗi cung ứng phụ tùng ô tô",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
