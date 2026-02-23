import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const db = requireSupabaseAdmin();
    const { data, error } = await db.from("api_configs").select("service,config_json");
    if (error) throw error;

    const items = (data ?? []).reduce<Record<string, unknown>>((acc, cur) => {
      acc[cur.service] = cur.config_json;
      return acc;
    }, {});

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const db = requireSupabaseAdmin();

    for (const [service, config_json] of Object.entries(body)) {
      const { error } = await db
        .from("api_configs")
        .upsert({ service, config_json, updated_at: new Date().toISOString() }, { onConflict: "service" });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
