import { NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase"; 

export async function POST(request: Request) {
  try {
    // 1. Đọc dữ liệu FormData gửi từ Front-end lên
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;
    const userId = formData.get("userId") as string | null;
    const username = formData.get("username") as string | null; //  THÊM DÒNG NÀY: Lấy username từ formData

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file ảnh" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "Thiếu thông tin User ID" }, { status: 400 });
    }

    // 2. Chuyển đổi File sang ArrayBuffer rồi bọc vào Blob
    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    // 3. Xử lý đặt tên file CỐ ĐỊNH theo cấu trúc: id-username.ext
    const fileExt = file.name.split(".").pop();
    
    // Nếu có username thì ghép dạng "1-khoadz.png", nếu không có thì fallback "1.png"
    const fileName = username 
      ? `${userId}-${username}.${fileExt}` 
      : `${userId}.${fileExt}`;
    
    // Lưu thẳng vào thư mục gốc của bucket để ăn theo Policy cũ của Khoa
    const filePath = fileName; 

    // 4. Thực hiện đẩy file ảnh lên Supabase Storage bucket (upsert: true sẽ tự ghi đè nếu trùng tên)
    const { error: uploadError } = await supabase.storage
      .from("avatars") 
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: true, // Quan trọng: Giúp ghi đè đè lên file cũ cùng tên
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError.message);
      return NextResponse.json({ error: `Lỗi khi lưu Storage: ${uploadError.message}` }, { status: 500 });
    }

    // 5. Lấy Public URL công khai
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json({ error: "Không thể lấy link ảnh công khai" }, { status: 500 });
    }

    // 6. Trả URL về cho Front-end
    return NextResponse.json({ avatarUrl: urlData.publicUrl });

  } catch (err: any) {
    console.error("Back-end Avatar Router Error:", err);
    return NextResponse.json({ error: err.message || "Lỗi xử lý hệ thống phía Server" }, { status: 500 });
  }
}