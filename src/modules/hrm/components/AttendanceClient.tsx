"use client";

import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

interface Option {
  id: string;
  [key: string]: unknown;
}

interface AttendanceRow {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  otHours: number;
  employee: { code: string; fullName: string };
  shift: { name: string } | null;
}

async function fetchOptions(url: string): Promise<Option[]> {
  const res = await fetch(url);
  const body = await res.json();
  return body.success ? body.data : [];
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function AttendanceClient() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [shifts, setShifts] = useState<Option[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/hrm/attendance");
    const body = await res.json();
    if (body.success) setRows(body.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetchOptions("/api/org/employees?pageSize=200").then(setEmployees);
    fetchOptions("/api/hrm/shifts?pageSize=100").then(setShifts);
  }, [load]);

  async function handleCheckIn() {
    setActing(true);
    setError(null);
    const res = await fetch("/api/hrm/attendance/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, shiftId: shiftId || undefined }),
    });
    const body = await res.json();
    if (!body.success) setError(body.error?.message ?? "Không thể chấm công vào");
    setActing(false);
    load();
  }

  async function handleCheckOut() {
    setActing(true);
    setError(null);
    const res = await fetch("/api/hrm/attendance/check-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    const body = await res.json();
    if (!body.success) setError(body.error?.message ?? "Không thể chấm công ra");
    setActing(false);
    load();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Chấm công</h1>
        <p className="mt-1 text-sm text-text-secondary">Chấm công vào/ra trong ngày — tăng ca tự tính nếu có gán ca làm việc.</p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Nhân viên</Label>
            <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {String(e.code)} - {String(e.fullName)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Ca làm việc (khi chấm vào)</Label>
            <Select value={shiftId} onChange={(e) => setShiftId(e.target.value)}>
              <option value="">-- Không gán ca --</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {String(s.name)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleCheckIn} disabled={acting || !employeeId} className="flex-1 gap-1.5">
              <LogIn size={16} /> Chấm vào
            </Button>
            <Button onClick={handleCheckOut} disabled={acting || !employeeId} variant="secondary" className="flex-1 gap-1.5">
              <LogOut size={16} /> Chấm ra
            </Button>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-semantic-danger">{error}</p>}
      </Card>

      <Card className="p-0">
        {loading ? (
          <EmptyState message="Đang tải..." />
        ) : rows.length === 0 ? (
          <EmptyState message="Chưa có dữ liệu chấm công" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Nhân viên</Th>
                <Th>Ngày</Th>
                <Th>Ca</Th>
                <Th>Giờ vào</Th>
                <Th>Giờ ra</Th>
                <Th>Tăng ca (giờ)</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((row) => (
                <Tr key={row.id}>
                  <Td>
                    {row.employee.code} - {row.employee.fullName}
                  </Td>
                  <Td>{row.date.slice(0, 10)}</Td>
                  <Td>{row.shift?.name ?? "—"}</Td>
                  <Td>{fmtTime(row.checkIn)}</Td>
                  <Td>{fmtTime(row.checkOut)}</Td>
                  <Td>{row.otHours}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
