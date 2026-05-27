import { NextResponse } from "next/server";
import { supabase } from "../supabase/index";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cfpIds } = body;

    if (!cfpIds || !Array.isArray(cfpIds) || cfpIds.length === 0) {
      return NextResponse.json({ success: false, message: "Mảng ID không hợp lệ." }, { status: 400 });
    }

    // 1. Lấy id và topics từ bảng cfp để so khớp lĩnh vực
    const { data: newCfps, error: cfpError } = await supabase
      .from("cfp")
      .select("id, topics")
      .in("id", cfpIds);

    if (cfpError) return NextResponse.json({ success: false, error: cfpError.message }, { status: 500 });
    if (!newCfps || newCfps.length === 0) return NextResponse.json({ success: false, message: "Không tìm thấy CfP." }, { status: 404 });

    // 2. Lấy danh sách người dùng nhận thông báo
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, interested_areas")
      .eq("notify_via_web", true);

    if (userError) return NextResponse.json({ success: false, error: userError.message }, { status: 500 });

    const notificationsToInsert: any[] = [];

    // 3. Vòng lặp so khớp lĩnh vực
    for (const cfp of newCfps) {
      if (!cfp.topics) continue;
      
      const cfpFields: string[] = cfp.topics
        .split(/[,;]+/)
        .map((f: string) => f.trim().toLowerCase());

      for (const user of users) {
        const userAreas = (user.interested_areas as string[]) || [];
        if (userAreas.length === 0) continue;

        const isMatched: boolean = userAreas.some((area: string) =>
          cfpFields.includes(area.trim().toLowerCase())
        );

        if (isMatched) {
          notificationsToInsert.push({
            user_id: user.id,
            cfp_id: cfp.id,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    if (notificationsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .upsert(notificationsToInsert, {
          onConflict: "user_id, cfp_id", 
          ignoreDuplicates: true,
        });

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Xử lý thành công dữ liệu thông báo.` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}