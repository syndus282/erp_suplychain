"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();

      if (!body.success) {
        setError(body.error?.message ?? "Đăng nhập thất bại");
        return;
      }

      const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Không thể kết nối tới máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-surface w-full max-w-sm rounded-xl p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-text-primary">Đăng nhập</h1>
      <p className="mb-6 text-sm text-text-secondary">ERP Chuỗi Cung Ứng Phụ Tùng Ô Tô</p>

      <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="username">
        Tên đăng nhập
      </label>
      <input
        id="username"
        name="username"
        autoComplete="username"
        className="mb-4 w-full rounded-lg border border-text-disabled/40 bg-surface-solid px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <label className="mb-1 block text-sm font-medium text-text-primary" htmlFor="password">
        Mật khẩu
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        className="mb-4 w-full rounded-lg border border-text-disabled/40 bg-surface-solid px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-brand-primary"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="mb-4 text-sm text-semantic-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
