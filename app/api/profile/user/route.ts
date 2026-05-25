import { NextResponse } from "next/server";
import { supabase } from "@/app/api/supabase"; 

// ==================== 1. API LẤY THÔNG TIN PROFILE (GET) ====================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, full_name, avatar_url, affiliation, bio, interested_areas, notify_via_email, notify_via_web")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase GET Error:", error.message);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ==================== 2. API CẬP NHẬT THÔNG TIN PROFILE (PUT) ====================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      full_name,
      avatar_url,
      affiliation,
      bio,
      interested_areas,
      notify_via_email,
      notify_via_web,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name,
        avatar_url,
        affiliation,
        bio,
        interested_areas,
        notify_via_email,
        notify_via_web,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase PUT Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}