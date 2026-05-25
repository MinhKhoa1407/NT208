import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;
  const { pathname, search } = request.nextUrl;

  // 1. Cho phép vào trang chủ (/) tự do
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 2. Bỏ qua nhóm trang /auth để tránh vòng lặp điều hướng vô hạn
  if (pathname.startsWith("/auth")) {
    if (isLoggedIn === "true") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Nếu CHƯA ĐĂNG NHẬP mà cố tình truy cập vào các trang private khác (Sidebar tabs)
  if (!isLoggedIn || isLoggedIn !== "true") {
    const currentUrl = `${pathname}${search}`;
    const loginUrl = new URL("/auth/login", request.url);
    // Lưu lại trang định vào vào tham số URL
    loginUrl.searchParams.set("returnUrl", currentUrl);
    
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|robot.png).*)",
  ],
};