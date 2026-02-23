"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Strategy = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  content_calendar: Record<string, string>;
  cluster_map: Record<string, string[]>;
};

export default function StrategyPage() {
  const [items, setItems] = useState<Strategy[]>([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const res = await fetch("/api/strategies", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    if (!title.trim()) return;
    await fetch("/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "draft" }),
    });
    setTitle("");
    await load();
  };

  const active = items.find((x) => x.status === "active") ?? items[0];

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="mb-1">戦略サマリー</CardTitle>
        <CardDescription>{active?.title ?? "戦略未作成"}</CardDescription>
        <p className="mt-2 text-sm text-slate-600">{active?.description ?? "-"}</p>
      </Card>

      <Card>
        <CardTitle className="mb-3">新規戦略生成（手動）</CardTitle>
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="戦略タイトル" />
          <Button onClick={create}>新規戦略生成</Button>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">コンテンツカレンダー</CardTitle>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-slate-50 p-2 text-xs">{i + 1}日: {(active?.content_calendar && active.content_calendar[String(i + 1)]) || "-"}</div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">テーマクラスターマップ</CardTitle>
        <div className="space-y-2 text-sm">
          {active?.cluster_map && Object.entries(active.cluster_map).length > 0 ? (
            Object.entries(active.cluster_map).map(([k, children]) => (
              <div key={k} className="rounded-lg border bg-slate-50 p-2">
                <p className="font-semibold">{k}</p>
                <p className="text-slate-600">{children.join(", ")}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500">クラスターデータなし</p>
          )}
        </div>
      </Card>
    </div>
  );
}
