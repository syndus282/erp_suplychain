import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { loadUserPermissions } from "./permissions";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./session-constants";

export { SESSION_COOKIE_NAME };

/** Phần được ký vào JWT — PHẢI nhỏ gọn (roles, không phải permissions). */
export interface SessionTokenPayload {
  sub: string; // userId
  companyId: string;
  username: string;
  employeeId: string | null;
  roles: string[];
}

/**
 * Session đầy đủ dùng trong route handler — `permissions` được nạp từ DB ở
 * mỗi request (qua `getCurrentSession()`), KHÔNG nhúng vào cookie. Trước đây
 * nhúng thẳng vào JWT nhưng khi số permission tăng theo từng phase (đến
 * Phase 7 là 164 permission), cookie vượt quá giới hạn ~4096 byte/cookie của
 * trình duyệt (RFC 6265) — trình duyệt lặng lẽ từ chối lưu cookie, khiến đăng
 * nhập "thành công" (200) nhưng session không bao giờ được lưu, mọi trang
 * sau đó bị đá về /login. Tách permissions ra khỏi JWT vừa sửa triệt để bug
 * này, vừa loại bỏ giới hạn cũ "đổi quyền phải đăng nhập lại mới có hiệu lực".
 */
export interface SessionPayload extends SessionTokenPayload {
  permissions: string[]; // "<resource>:<action>", xem docs/business-spec/13 mục 21
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET chưa được cấu hình — xem .env.example. Không được có giá trị mặc định hard-code vì đây là khóa ký session."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionTokenPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

/**
 * Đọc & verify session hiện tại từ cookie, rồi nạp permissions mới nhất từ DB
 * (dùng trong route handler, Node runtime) — xem lý do ở JSDoc `SessionPayload`.
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenPayload = await verifySessionToken(token);
  if (!tokenPayload) return null;

  const { permissions } = await loadUserPermissions(tokenPayload.sub);
  return { ...tokenPayload, permissions };
}
