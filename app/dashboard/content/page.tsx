"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Article, ArticleStatus } from "@/types/dashboard";

const stages: ArticleStatus[] = ["planned", "researching", "writing", "reviewing", "approved", "published"];

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/articles", { cache: "no-store" });
    const data = await res.json();
    setArticles(data.items ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<ArticleStatus, Article[]> = {
      planned: [], researching: [], writing: [], reviewing: [], approved: [], published: [],
    };
    for (const article of articles) map[article.status].push(article);
    return map;
  }, [articles]);

  const nextStage = (status: ArticleStatus): ArticleStatus => {
    const idx = stages.indexOf(status);
    return stages[Math.min(idx + 1, stages.length - 1)];
  };

  const moveNext = async (item: Article) => {
    const status = nextStage(item.status);
    await fetch(`/api/articles/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const create = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "planned" }),
    });
    setTitle("");
    setLoading(false);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="新規記事タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button onClick={create} disabled={loading}>{loading ? "作成中" : "新規記事"}</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-6">
        {stages.map((stage) => (
          <Card key={stage} className="p-3">
            <CardTitle className="mb-3 text-sm capitalize">{stage}</CardTitle>
            <div className="space-y-2">
              {grouped[stage].map((item) => (
                <div key={item.id} className="rounded-lg border bg-slate-50 p-2 text-xs">
                  <p className="font-semibold">{item.title}</p>
                  <p>文字数: {item.actual_word_count}/{item.target_word_count}</p>
                  <p>SEO: {item.seo_score.toFixed(1)}</p>
                  {stage !== "published" ? (
                    <Button className="mt-2 h-7 w-full px-2 py-1 text-xs" onClick={() => moveNext(item)}>
                      次のステージへ
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
