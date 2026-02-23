import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("keywords").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("keywords").insert({
      keyword: body.keyword,
      volume: body.volume ?? 0,
      kd: body.kd ?? 0,
      cpc: body.cpc ?? 0,
      intent: body.intent ?? "informational",
      cluster_id: body.cluster_id ?? null,
      priority: body.priority ?? 0,
      status: body.status ?? "new",
    }).select("*").single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
