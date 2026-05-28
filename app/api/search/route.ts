// app/api/search/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase/index"; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const tab = searchParams.get("tab") || "conference"; 
    const query = searchParams.get("q") || "";          
    const field = searchParams.get("field") || "";   
    const country = searchParams.get("country") || ""; 
    
    // Đọc danh sách ranks từ query string
    const ranksRaw = searchParams.get("ranks");
    const ranks = ranksRaw ? ranksRaw.split(",").map(r => r.trim()).filter(Boolean) : []; 
    
    const isOpenAccess = searchParams.get("open_access") === "true";
    const isHighHIndex = searchParams.get("high_h_index") === "true";
    const isUpcomingDeadline = searchParams.get("upcoming_deadline") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const tableName = tab === "conference" ? "conferences" : "journals";
    
    let dbQuery = supabase.from(tableName).select(
      tab === "journal" ? "*, publishers(name)" : "*", 
      { count: "exact" }
    );

    let orConditions: string[] = [];
    if (query.trim() !== "") {
      if (tab === "conference") {
        orConditions.push(`full_name.ilike.%${query}%,acronym.ilike.%${query}%`);
      } else {
        orConditions.push(`name.ilike.%${query}%,issn.ilike.%${query}%`);
      }
    }
    if (field.trim() !== "") {
      const fieldColumn = tab === "conference" ? "field" : "subject_area";
      orConditions.push(`${fieldColumn}.ilike.%${field}%`);
    }
    if (country.trim() !== "") {
      const countryColumn = tab === "conference" ? "location" : "country";
      orConditions.push(`${countryColumn}.ilike.%${country}%`);
    }
    if (orConditions.length > 0) {
      dbQuery = dbQuery.or(orConditions.join(","));
    }

    // ================= 🛠️ XỬ LÝ LOGIC BỘ LỌC RANKS (ĐÃ FIX TRIỆT ĐỂ LỖI 500 & PGRST100) =================
    if (ranks && ranks.length > 0) {
      const rankColumn = tab === "conference" ? "rank" : "quartile";

      if (tab === "conference") {
        const hasOthers = ranks.includes("Others");
        const hasUnranked = ranks.includes("Unranked");

        if (hasOthers) {
          /**
           * 🎯 LOGIC LOẠI TRỪ (EXCLUSION):
           * Khi chọn Others, ta lấy tất cả trừ các hạng chuẩn không được tích chọn.
           */
          const standardRanks = ["A*", "A", "B", "C"];
          // Tìm xem những hạng chuẩn nào người dùng KHÔNG tích chọn để tiến hành loại trừ chúng
          const missingStandards = standardRanks.filter(r => !ranks.includes(r));
          
          if (missingStandards.length > 0) {
            dbQuery = dbQuery.not(rankColumn, "in", `(${missingStandards.join(",")})`);
          }

          // Nếu người dùng chọn Others nhưng KHÔNG chọn Unranked, ta loại bỏ toàn bộ các dòng vô định
          if (!hasUnranked) {
            dbQuery = dbQuery
              .not(rankColumn, "ilike", "unranked%")
              .not(rankColumn, "eq", "N/A")
              .not(rankColumn, "eq", "")
              .not(rankColumn, "is", null); // ✅ ĐÃ FIX THÀNH CÔNG: Sử dụng cú pháp .not(..., "is", null) hợp lệ
          }
        } else {
          /**
           * 🎯 LOGIC LỰA CHỌN TRỰC TIẾP (INCLUSION): Khi không tích chọn Others
           */
          const selectedStandards = ranks.filter(r => r !== "Unranked");
          let rankOrConditions: string[] = [];

          if (selectedStandards.length > 0) {
            rankOrConditions.push(`${rankColumn}.in.(${selectedStandards.join(",")})`);
          }

          if (hasUnranked) {
            rankOrConditions.push(`${rankColumn}.ilike.unranked%`);
            rankOrConditions.push(`${rankColumn}.eq.N/A`);
            rankOrConditions.push(`${rankColumn}.eq.`);
            rankOrConditions.push(`${rankColumn}.is.null`);
          }

          if (rankOrConditions.length > 0) {
            dbQuery = dbQuery.or(rankOrConditions.join(","));
          }
        }
      } else {
        // Đối với Journals (Q1, Q2, Q3, Q4)
        dbQuery = dbQuery.in(rankColumn, ranks);
      }
    }
    // =========================================================================================

    if (tab === "journal") {
      if (isOpenAccess) dbQuery = dbQuery.eq("open_access", "Yes");
      if (isHighHIndex) dbQuery = dbQuery.gte("h_index", 100);
    } else {
      if (isUpcomingDeadline) {
        const today = new Date().toISOString().split('T')[0];
        dbQuery = dbQuery.gte("submission_deadline", today);
      }
    }

    const { data, error, count } = await dbQuery
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (err: any) {
    console.error("API Server Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}