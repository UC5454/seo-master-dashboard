import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? 30);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const db = requireSupabaseAdmin();
    const { data, error } = await db
      .from("rank_history")
      .select("date,position,impressions,clicks,ctr,keywords(keyword)")
      .gte("date", since.toISOString().slice(0, 10))
      .order("date", { ascending: false });

    if (error) throw error;

    const items = (data ?? []).map((row, idx, arr) => {
      const prev = arr[idx + 1];
      const prevPosition = prev?.position ?? row.position ?? 0;
      return {
        keyword: (row.keywords as { keyword?: string } | null)?.keyword ?? "-",
        date: row.date,
        position: row.position ?? 0,
        impressions: row.impressions ?? 0,
        clicks: row.clicks ?? 0,
        ctr: row.ctr ?? 0,
        delta: (row.position ?? 0) - prevPosition,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
