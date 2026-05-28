import { supabase } from '@/app/api/supabase/index';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Kiểm tra dữ liệu đầu vào rỗng
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ thông tin" }, { status: 400 });
    }

    // 1. Đăng ký tài khoản với Supabase Auth
    // (Lưu ý: Bạn phải tắt nút "Confirm email" trên Supabase Dashboard trước để không bị lỗi gửi mail)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Lưu username vào auth metadata
        }
      }
    });

    if (authError) {
      console.error("=== LỖI TỪ SUPABASE AUTH ===", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Hệ thống Auth không tạo được User" }, { status: 400 });
    }

    // 2. Chèn thông tin hồ sơ vào bảng public.users 
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        { 
          email: email,
          username: username
        }
      ]);

    if (dbError) {
      console.error("=== LỖI CHÈN DATABASE (PUBLIC.USERS) ===", dbError.message);
      return NextResponse.json({ error: "Tạo tài khoản Auth thành công nhưng không đồng bộ được Database Profile!" }, { status: 500 });
    }

    // Trả về kết quả thành công hoàn toàn (đăng ký xong có thể đăng nhập được ngay)
    return NextResponse.json({
      message: "Đăng ký tài khoản thành công!",
      requiresVerification: false,
      user: {
        id: authData.user.id,
        email: email,
        username: username
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("=== LỖI CRASH HỆ THỐNG TẠI CATCH BLOCK ===", error);
    return NextResponse.json({ 
      error: error.message || "Có lỗi bất ngờ xảy ra trong quá trình đăng ký!" 
    }, { status: 500 });
  }
}