import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db
      .from("analytics_snapshots")
      .select("date,page_path,pageviews,sessions,users,avg_engagement_time,bounce_rate,source_medium")
      .order("date", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
