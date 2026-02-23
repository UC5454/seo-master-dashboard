import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("competitors").select("*").order("created_at", { ascending: false });
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
    const { data, error } = await db.from("competitors").insert({
      domain: body.domain,
      metrics_json: body.metrics_json ?? { traffic: 0, keywords: 0, backlinks: 0 },
      notes: body.notes ?? null,
      last_analyzed: body.last_analyzed ?? null,
    }).select("*").single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
