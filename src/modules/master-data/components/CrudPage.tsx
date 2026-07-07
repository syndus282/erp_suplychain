"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, FieldError } from "@/components/ui/Input";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";

export interface CrudFieldOption {
  value: string;
  label: string;
}

export interface CrudField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea";
  required?: boolean;
  optionsUrl?: string; // trả {success,data:[...]}
  optionLabelKey?: string; // mặc định "name"
  options?: CrudFieldOption[]; // options tĩnh (vd. enum) — ưu tiên hơn optionsUrl nếu có cả 2
  multiple?: boolean; // select nhiều giá trị (lưu mảng id)
}

export interface CrudColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface CrudPageProps<T extends { id: string }> {
  title: string;
  description?: string;
  apiPath: string;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  searchPlaceholder?: string;
  /** Query param cố định gắn thêm vào mọi request list, vd. { warehouseId }. */
  extraQueryParams?: Record<string, string>;
  /** Giá trị cố định gắn thêm vào payload khi tạo mới (không hiển thị trên form), vd. { warehouseId }. */
  fixedCreateValues?: Record<string, unknown>;
  hideSearch?: boolean;
  /** Dùng khi shape của row (vd. quan hệ nested) không khớp trực tiếp tên field trong form — xem trang Products. */
  mapRowToForm?: (row: T) => Record<string, unknown>;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta?: { page: number; pageSize: number; totalItems: number; totalPages: number };
  error?: { message: string };
}

export function CrudPage<T extends { id: string }>({
  title,
  description,
  apiPath,
  columns,
  fields,
  searchPlaceholder,
  extraQueryParams,
  fixedCreateValues,
  hideSearch,
  mapRowToForm,
}: CrudPageProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listError, setListError] = useState<string | null>(null);

  const [options, setOptions] = useState<Record<string, CrudFieldOption[]>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | boolean | string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setListError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: "20", ...extraQueryParams });
    if (search) params.set("search", search);
    const res = await fetch(`${apiPath}?${params}`);
    const body: ListResponse<T> = await res.json();
    if (!body.success) {
      setListError(body.error?.message ?? "Không tải được dữ liệu");
      setRows([]);
    } else {
      setRows(body.data);
      setTotalPages(body.meta?.totalPages ?? 1);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath, page, search, JSON.stringify(extraQueryParams)]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    fields
      .filter((f) => f.optionsUrl && !f.options)
      .forEach(async (f) => {
        const res = await fetch(f.optionsUrl!);
        const body = await res.json();
        if (body.success) {
          const labelKey = f.optionLabelKey ?? "name";
          setOptions((prev) => ({
            ...prev,
            [f.name]: body.data.map((item: Record<string, unknown>) => ({
              value: String(item.id),
              label: String(item[labelKey] ?? item.id),
            })),
          }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    const initial: Record<string, string | boolean | string[]> = {};
    for (const f of fields) initial[f.name] = f.type === "checkbox" ? false : f.multiple ? [] : "";
    setFormValues(initial);
    setFieldErrors({});
    setFormError(null);
    setPanelOpen(true);
  }

  function openEdit(row: T) {
    setEditing(row);
    const source = (mapRowToForm ? mapRowToForm(row) : (row as unknown as Record<string, unknown>)) ?? {};
    const initial: Record<string, string | boolean | string[]> = {};
    for (const f of fields) {
      const value = source[f.name];
      if (f.type === "checkbox") initial[f.name] = Boolean(value);
      else if (f.multiple) initial[f.name] = Array.isArray(value) ? (value as string[]) : [];
      else initial[f.name] = value === null || value === undefined ? "" : String(value);
    }
    setFormValues(initial);
    setFieldErrors({});
    setFormError(null);
    setPanelOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = formValues[f.name];
      if (f.type === "number") payload[f.name] = v === "" ? undefined : Number(v);
      else payload[f.name] = v;
    }
    if (!editing && fixedCreateValues) Object.assign(payload, fixedCreateValues);

    const url = editing ? `${apiPath}/${editing.id}` : apiPath;
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();

    if (!body.success) {
      if (Array.isArray(body.error?.details)) {
        const errs: Record<string, string> = {};
        for (const d of body.error.details) errs[d.field] = d.message;
        setFieldErrors(errs);
      }
      setFormError(body.error?.message ?? "Có lỗi xảy ra");
      setSaving(false);
      return;
    }

    setSaving(false);
    setPanelOpen(false);
    loadList();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} />
          Thêm mới
        </Button>
      </div>

      {!hideSearch && (
        <div className="mb-4 max-w-sm">
          <Input
            placeholder={searchPlaceholder ?? "Tìm kiếm..."}
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      )}

      <Card className="p-0">
        {listError ? (
          <EmptyState message={listError} />
        ) : (
          <Table>
            <Thead>
              <tr>
                {columns.map((c) => (
                  <Th key={c.key}>{c.label}</Th>
                ))}
                <Th>Hành động</Th>
              </tr>
            </Thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <EmptyState message="Đang tải..." />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <EmptyState message="Chưa có dữ liệu" />
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <Tr key={row.id}>
                    {columns.map((c) => (
                      <Td key={c.key}>
                        {c.render ? c.render(row) : String((row as unknown as Record<string, unknown>)[c.key] ?? "")}
                      </Td>
                    ))}
                    <Td>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        aria-label="Sửa"
                        className="rounded p-1 text-text-secondary hover:bg-surface-glass hover:text-brand-primary"
                      >
                        <Pencil size={16} />
                      </button>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </Button>
          <span className="text-text-secondary">
            Trang {page}/{totalPages}
          </span>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-surface-overlay-scrim">
          <div className="glass-surface h-full w-full max-w-md overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {editing ? "Chỉnh sửa" : "Thêm mới"} {title.toLowerCase()}
              </h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Đóng"
                className="rounded p-1 text-text-secondary hover:bg-surface-glass"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <Label htmlFor={f.name}>
                    {f.label}
                    {f.required && <span className="text-semantic-danger"> *</span>}
                  </Label>

                  {f.type === "select" ? (
                    <Select
                      id={f.name}
                      multiple={f.multiple}
                      value={
                        f.multiple
                          ? ((formValues[f.name] as string[]) ?? [])
                          : ((formValues[f.name] as string) ?? "")
                      }
                      onChange={(e) => {
                        if (f.multiple) {
                          const values = Array.from(e.target.selectedOptions).map((o) => o.value);
                          setFormValues((prev) => ({ ...prev, [f.name]: values }));
                        } else {
                          setFormValues((prev) => ({ ...prev, [f.name]: e.target.value }));
                        }
                      }}
                    >
                      {!f.multiple && <option value="">-- Chọn --</option>}
                      {(f.options ?? options[f.name] ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  ) : f.type === "checkbox" ? (
                    <input
                      id={f.name}
                      type="checkbox"
                      checked={Boolean(formValues[f.name])}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [f.name]: e.target.checked }))}
                      className="h-4 w-4 rounded border-text-disabled/40"
                    />
                  ) : (
                    <Input
                      id={f.name}
                      type={f.type === "number" ? "number" : "text"}
                      value={(formValues[f.name] as string) ?? ""}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                    />
                  )}
                  <FieldError message={fieldErrors[f.name]} />
                </div>
              ))}

              {formError && <p className="text-sm text-semantic-danger">{formError}</p>}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPanelOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
