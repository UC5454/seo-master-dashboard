"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type KeywordRow = {
  id: string;
  keyword: string;
  volume: number;
  kd: number;
  cpc: number;
  intent: string;
  status: string;
  cluster_id: string | null;
};

const intentStyle: Record<string, string> = {
  informational: "bg-blue-100 text-blue-700",
  commercial: "bg-green-100 text-green-700",
  transactional: "bg-purple-100 text-purple-700",
  navigational: "bg-gray-200 text-gray-700",
};

export default function KeywordsPage() {
  const [rows, setRows] = useState<KeywordRow[]>([]);
  const [intent, setIntent] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "kd">("volume");
  const [keyword, setKeyword] = useState("");

  const load = async () => {
    const res = await fetch("/api/keywords", { cache: "no-store" });
    const data = await res.json();
    setRows(data.items ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...rows]
      .filter((r) => (!intent ? true : r.intent === intent))
      .filter((r) => (!status ? true : r.status === status))
      .sort((a, b) => b[sortBy] - a[sortBy]);
    return sorted;
  }, [rows, intent, status, sortBy]);

  const addKeyword = async () => {
    if (!keyword.trim()) return;
    await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, intent: "informational" }),
    });
    setKeyword("");
    await load();
  };

  return (
    <Card>
      <CardTitle className="mb-4">キーワード管理</CardTitle>
      <div className="mb-4 grid gap-2 md:grid-cols-5">
        <Select value={intent} onChange={(e) => setIntent(e.target.value)}>
          <option value="">Intent全て</option>
          <option value="informational">informational</option>
          <option value="commercial">commercial</option>
          <option value="transactional">transactional</option>
          <option value="navigational">navigational</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status全て</option>
          <option value="new">new</option>
          <option value="tracking">tracking</option>
          <option value="targeted">targeted</option>
          <option value="archived">archived</option>
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as "volume" | "kd")}>
          <option value="volume">volume順</option>
          <option value="kd">KD順</option>
        </Select>
        <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="キーワード追加" />
        <Button onClick={addKeyword}>追加</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <TR><TH>keyword</TH><TH>volume</TH><TH>KD</TH><TH>CPC</TH><TH>intent</TH><TH>cluster</TH><TH>status</TH></TR>
          </THead>
          <TBody>
            {filtered.map((r) => (
              <TR key={r.id}>
                <TD>{r.keyword}</TD>
                <TD>{r.volume}</TD>
                <TD>{r.kd}</TD>
                <TD>{r.cpc}</TD>
                <TD><Badge className={intentStyle[r.intent] ?? "bg-slate-100"}>{r.intent}</Badge></TD>
                <TD>{r.cluster_id ?? "-"}</TD>
                <TD>{r.status}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </Card>
  );
}
