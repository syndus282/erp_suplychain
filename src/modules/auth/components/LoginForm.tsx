"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
    <form onSubmit={handleSubmit} className="glass-surface w-full max-w-sm rounded-3xl p-8">
      <h1 className="mb-1 text-xl font-semibold text-text-primary">Đăng nhập</h1>
      <p className="mb-6 text-sm text-text-secondary">ERP Chuỗi Cung Ứng Phụ Tùng Ô Tô</p>

      <div className="mb-4">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="mb-4 text-sm text-semantic-danger">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
