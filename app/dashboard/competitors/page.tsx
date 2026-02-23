"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type Competitor = {
  id: string;
  domain: string;
  metrics_json: { traffic?: number; keywords?: number; backlinks?: number };
};

export default function CompetitorsPage() {
  const [items, setItems] = useState<Competitor[]>([]);
  const [domain, setDomain] = useState("");

  const load = async () => {
    const res = await fetch("/api/competitors", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async () => {
    if (!domain.trim()) return;
    await fetch("/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    setDomain("");
    await load();
  };

  const chartData = items.map((i) => ({
    domain: i.domain,
    traffic: i.metrics_json?.traffic ?? 0,
    keywords: i.metrics_json?.keywords ?? 0,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="mb-3">競合ドメイン</CardTitle>
        <div className="mb-3 flex gap-2">
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
          <Button onClick={add}>ドメイン追加</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead><TR><TH>domain</TH><TH>traffic</TH><TH>keywords</TH><TH>backlinks</TH></TR></THead>
            <TBody>
              {items.map((i) => (
                <TR key={i.id}><TD>{i.domain}</TD><TD>{i.metrics_json?.traffic ?? 0}</TD><TD>{i.metrics_json?.keywords ?? 0}</TD><TD>{i.metrics_json?.backlinks ?? 0}</TD></TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">競合比較</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="traffic" fill="#2C5282" />
              <Bar dataKey="keywords" fill="#1B2A4A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
