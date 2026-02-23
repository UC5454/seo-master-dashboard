"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type Citation = {
  id: string;
  ai_service: "chatgpt" | "perplexity" | "gemini" | "claude";
  cited: boolean;
  citation_text: string | null;
  keyword: string;
};

export default function AioPage() {
  const [items, setItems] = useState<Citation[]>([]);

  useEffect(() => {
    fetch("/api/aio", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  const rate = useMemo(() => {
    if (!items.length) return 0;
    return (items.filter((i) => i.cited).length / items.length) * 100;
  }, [items]);

  const byService = useMemo(() => {
    const services: Citation["ai_service"][] = ["chatgpt", "perplexity", "gemini", "claude"];
    return services.map((service) => {
      const rows = items.filter((i) => i.ai_service === service);
      const cited = rows.filter((r) => r.cited).length;
      return { service, total: rows.length, cited, rate: rows.length ? (cited / rows.length) * 100 : 0 };
    });
  }, [items]);

  return (
    <div className="space-y-4">
      <Card>
        <CardDescription>AI引用率</CardDescription>
        <CardTitle>{rate.toFixed(1)}%</CardTitle>
      </Card>

      <Card>
        <CardTitle className="mb-3">サービス別</CardTitle>
        <Table>
          <THead><TR><TH>service</TH><TH>citation数</TH><TH>total</TH><TH>rate</TH></TR></THead>
          <TBody>
            {byService.map((s) => <TR key={s.service}><TD>{s.service}</TD><TD>{s.cited}</TD><TD>{s.total}</TD><TD>{s.rate.toFixed(1)}%</TD></TR>)}
          </TBody>
        </Table>
      </Card>

      <Card>
        <CardTitle className="mb-3">キーワード別引用状況</CardTitle>
        <Table>
          <THead><TR><TH>keyword</TH><TH>service</TH><TH>cited</TH><TH>citation</TH></TR></THead>
          <TBody>
            {items.map((it) => <TR key={it.id}><TD>{it.keyword}</TD><TD>{it.ai_service}</TD><TD>{it.cited ? "Yes" : "No"}</TD><TD>{it.citation_text ?? "-"}</TD></TR>)}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
