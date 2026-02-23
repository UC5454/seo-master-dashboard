import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";
import { requireSupabaseAdmin } from "@/lib/supabase";
import { createGoogleDoc } from "@/lib/gdocs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const db = requireSupabaseAdmin();

    // ステータスが "approved" に変更される場合、Google Docs を自動生成
    if (body.status === "approved") {
      const { data: article } = await db.from("articles").select("title, content_md, gdoc_id").eq("id", id).single();
      if (article && !article.gdoc_id && article.content_md) {
        try {
          const gdocId = await createGoogleDoc(
            article.title || "Untitled Article",
            article.content_md
          );
          body.gdoc_id = gdocId;
        } catch (gdocError) {
          console.error("Google Docs creation failed:", gdocError);
          // Docs生成失敗してもステータス更新は続行する
        }
      }
    }

    const { data, error } = await db.from("articles").update(body).eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ item: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const db = requireSupabaseAdmin();
    const { error } = await db.from("articles").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
