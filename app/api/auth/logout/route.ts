import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Đăng xuất thành công!" },
    { status: 200 }
  );

  // Ép cookie isLoggedIn hết hạn ngay lập tức từ phía Server
  response.cookies.set("isLoggedIn", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // Thiết lập thời gian về quá khứ để xóa cookie
  });

  return response;
}