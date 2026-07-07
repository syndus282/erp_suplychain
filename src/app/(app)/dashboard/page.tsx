import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-text-primary">Dashboard</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Dashboard điều hành đầy đủ (doanh thu, tồn kho, công nợ...) thuộc Phase 11 —
        đây là trang tổng quan tạm thời của Phase 1.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-text-secondary">Module đã sẵn sàng</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">Foundation</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">Phase hiện tại</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-text-primary">Phase 1</p>
        </Card>
      </div>
    </div>
  );
}
