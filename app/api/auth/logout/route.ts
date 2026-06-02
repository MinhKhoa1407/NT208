import { supabase } from "@/app/api/supabase/index";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body?.userId;

    if (userId) {
      await supabase
        .from("users")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    const response = NextResponse.json(
      { message: "Đăng xuất thành công!" },
      { status: 200 }
    );

    response.cookies.set("isLoggedIn", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}