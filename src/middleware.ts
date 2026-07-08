import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/modules/auth/lib/session-constants";

// Middleware chạy Edge runtime — chỉ xác thực (có session hợp lệ hay không),
// KHÔNG check permission chi tiết (cần Prisma/DB, không chạy được ở edge với
// SQLite). Authorization theo Permission thực hiện trong từng route handler
// qua requirePermission() (xem src/modules/auth/lib/permissions.ts).
//
// QUAN TRỌNG: import hằng số từ "./session-constants", KHÔNG từ "./session" —
// session.ts import permissions.ts (kéo theo Prisma) để nạp permission mỗi
// request; nếu middleware import session.ts, toàn bộ Prisma client sẽ bị kéo
// vào bundle Edge runtime dù không dùng tới (đã từng làm bundle middleware
// phình từ ~40kB lên ~113kB).

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const authenticated = await hasValidSession(request);
  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Chưa đăng nhập hoặc phiên đã hết hạn" } },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Áp dụng mọi route trừ: _next/static, _next/image, favicon.ico, các file
     * tĩnh trong /public (svg/png/...).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
