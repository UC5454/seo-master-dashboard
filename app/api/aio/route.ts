import { NextRequest, NextResponse } from "next/server";
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

// AIO引用チェック: 指定キーワードでClaude APIに問い合わせ、自社ドメインの引用有無を判定
export async function POST(req: NextRequest) {
  const session = await requireApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { keyword_ids } = await req.json() as { keyword_ids?: string[] };
    if (!keyword_ids?.length) {
      return NextResponse.json({ error: "keyword_ids required" }, { status: 400 });
    }

    const db = requireSupabaseAdmin();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    // api_configs からターゲットドメインを取得
    const { data: configData } = await db
      .from("api_configs")
      .select("config_json")
      .eq("service", "site")
      .single();
    const targetDomain = (configData?.config_json as { domain?: string })?.domain || "digital-gorilla.co.jp";

    // キーワード情報取得
    const { data: keywords, error: kwError } = await db
      .from("keywords")
      .select("id, keyword")
      .in("id", keyword_ids);
    if (kwError) throw kwError;

    const results: { keyword_id: string; keyword: string; cited: boolean; citation_text: string | null }[] = [];

    for (const kw of keywords ?? []) {
      try {
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `「${kw.keyword}」について詳しく教えてください。参考になるウェブサイトやソースがあれば、URLも含めて紹介してください。`,
              },
            ],
          }),
        });

        if (!claudeRes.ok) {
          results.push({ keyword_id: kw.id, keyword: kw.keyword, cited: false, citation_text: null });
          continue;
        }

        const claudeData = await claudeRes.json() as {
          content: { type: string; text?: string }[];
        };
        const responseText = claudeData.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("\n");

        // ターゲットドメインの引用有無を判定
        const cited = responseText.toLowerCase().includes(targetDomain.toLowerCase());
        const citationText = cited
          ? responseText.split("\n").filter((line) => line.toLowerCase().includes(targetDomain.toLowerCase())).join("\n").slice(0, 500)
          : null;

        // aio_citations テーブルに挿入
        await db.from("aio_citations").insert({
          keyword_id: kw.id,
          ai_service: "claude",
          cited,
          citation_text: citationText,
          checked_at: new Date().toISOString(),
        });

        results.push({ keyword_id: kw.id, keyword: kw.keyword, cited, citation_text: citationText });
      } catch {
        results.push({ keyword_id: kw.id, keyword: kw.keyword, cited: false, citation_text: null });
      }
    }

    return NextResponse.json({ results, checked: results.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
