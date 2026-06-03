import { supabase } from '@/app/api/supabase/index';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    // 1. Đăng nhập qua Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    // 2. Lấy thông tin user từ bảng public.users của bạn
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, created_at') // Bạn có thể thêm lại 'research_interests' nếu bảng của bạn có cột này nhé
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "Người dùng không tồn tại trong bảng profile" }, { status: 404 });
    }

    await supabase
    .from("users")
    .update({
      is_online: true,
      last_seen: new Date().toISOString(),
    })
    .eq("id", userData.id);
    console.log(
  "ONLINE UPDATED:",
  userData.id
);

    // 3. TẠO RESPONSE VÀ ĐÍNH KÈM COOKIE KHI ĐĂNG NHẬP THÀNH CÔNG
    const response = NextResponse.json({
      message: "Đăng nhập thành công!",
      user: userData // Sử dụng đúng cục dữ liệu userData vừa lấy ở trên
    }, { status: 200 });

    // Cài đặt cookie "isLoggedIn" để file middleware.ts ở ngoài có thể đọc được ngay lập tức
    response.cookies.set("isLoggedIn", "true", {
      path: "/",
      httpOnly: true, // Bảo mật chống hack token qua script client (XSS)
      maxAge: 60 * 60 * 24 * 7, // Giữ trạng thái đăng nhập trong 7 ngày
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("=== LỖI ĐĂNG NHẬP ===", error);
    return NextResponse.json({ error: "Đăng nhập thất bại!" }, { status: 500 });
  }
}