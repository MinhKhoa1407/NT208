import { NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase"; // Import instance supabase của Khoa

// 🌟 HÀM UTILS: Chuyển đổi một chuỗi bất kỳ thành dạng Title Case (Viết hoa chữ cái đầu của mỗi từ)
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function GET() {
  try {
    // 1. CHỈ LẤY dữ liệu 'field' từ bảng conferences (liên quan trực tiếp đến CfP)
    const { data: confFields, error: confError } = await supabase
      .from("conferences")
      .select("field")
      .not("field", "is", null);

    if (confError) throw confError;

    // 2. Xử lý gộp, tách chuỗi và chuẩn hóa viết hoa chống trùng lặp
    const areaSet = new Set<string>();

    confFields?.forEach((item) => {
      if (item.field) {
        // Chỉ tách theo dấu phẩy (,) hoặc dấu chấm phẩy (;) để giữ nguyên cụm từ có khoảng trắng
        const fields = item.field.split(/[,;]+/);
        
        fields.forEach((f: string) => {
          // Xóa khoảng trắng thừa ở hai đầu cụm từ
          const trimmedField = f.trim();
          
          if (trimmedField) {
            // 🌟 CHUẨN HÓA TẠI ĐÂY: Đưa "computer science" hay "COMPUTER SCIENCE" về chung một dạng "Computer Science"
            const normalizedField = toTitleCase(trimmedField);
            
            // Nạp vào Set (Set sẽ tự động loại bỏ nếu từ này đã tồn tại)
            areaSet.add(normalizedField);
          }
        });
      }
    });

    // 3. Chuyển Set thành Mảng và sắp xếp theo thứ tự bảng chữ cái A-Z
    const uniqueAreas = Array.from(areaSet).sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ areas: uniqueAreas });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách lĩnh vực từ Conferences:", error.message);
    return NextResponse.json(
      { error: "Không thể tải danh sách lĩnh vực từ hệ thống hội nghị" },
      { status: 500 }
    );
  }
}