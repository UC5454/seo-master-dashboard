import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("articles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("articles").insert({
      title: body.title,
      keyword_id: body.keyword_id ?? null,
      strategy_id: body.strategy_id ?? null,
      status: body.status ?? "planned",
      target_word_count: body.target_word_count ?? 3000,
      actual_word_count: body.actual_word_count ?? 0,
      seo_score: body.seo_score ?? 0,
      aio_score: body.aio_score ?? 0,
      content_md: body.content_md ?? null,
      meta_description: body.meta_description ?? null,
      reviewer_notes: body.reviewer_notes ?? null,
      gdoc_id: body.gdoc_id ?? null,
      published_at: body.published_at ?? null,
    }).select("*").single();

    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
