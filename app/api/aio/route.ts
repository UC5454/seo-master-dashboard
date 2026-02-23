import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db
      .from("aio_citations")
      .select("id,ai_service,cited,citation_text,keywords(keyword)")
      .order("checked_at", { ascending: false });

    if (error) throw error;
    const items = (data ?? []).map((row) => ({
      id: row.id,
      ai_service: row.ai_service,
      cited: row.cited,
      citation_text: row.citation_text,
      keyword: (row.keywords as { keyword?: string } | null)?.keyword ?? "-",
    }));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
