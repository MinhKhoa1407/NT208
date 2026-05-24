// app/api/search/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase/route"; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const tab = searchParams.get("tab") || "conference"; 
    const query = searchParams.get("q") || "";          
    const field = searchParams.get("field") || "";   
    const country = searchParams.get("country") || ""; 
    const ranks = searchParams.get("ranks") ? searchParams.get("ranks")?.split(",") : []; 
    
    const isOpenAccess = searchParams.get("open_access") === "true";
    const isHighHIndex = searchParams.get("high_h_index") === "true";
    const isUpcomingDeadline = searchParams.get("upcoming_deadline") === "true";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const tableName = tab === "conference" ? "conferences" : "journals";
    
    // 🌟 THAY ĐỔI: Nếu chọn tab journal, tự động JOIN lấy thêm thuộc tính name từ bảng public.publishers
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

    if (ranks && ranks.length > 0) {
      const rankColumn = tab === "conference" ? "rank" : "quartile";
      dbQuery = dbQuery.in(rankColumn, ranks);
    }
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
      console.error("Lỗi truy vấn database Supabase:", error);
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
    console.error("Lỗi hệ thống API Search:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}