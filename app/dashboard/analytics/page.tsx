"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type Snapshot = {
  date: string;
  page_path: string;
  pageviews: number;
  sessions: number;
  source_medium: string;
};

const colors = ["#1B2A4A", "#2C5282", "#3b82f6", "#93c5fd", "#bfdbfe"];

export default function AnalyticsPage() {
  const [items, setItems] = useState<Snapshot[]>([]);

  useEffect(() => {
    fetch("/api/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, []);

  const trend = items.map((i) => ({ date: i.date, sessions: i.sessions }));
  const sources = Object.entries(
    items.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.source_medium || "(none)"] = (acc[cur.source_medium || "(none)"] ?? 0) + cur.sessions;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const topPages = [...items].sort((a, b) => b.pageviews - a.pageviews).slice(0, 10);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="mb-3">トラフィック推移</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /><YAxis /><Tooltip />
              <Line dataKey="sessions" stroke="#2C5282" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">流入経路</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sources} dataKey="value" nameKey="name" outerRadius={110}>
                {sources.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">トップページ</CardTitle>
        <Table>
          <THead><TR><TH>page_path</TH><TH>pageviews</TH><TH>sessions</TH></TR></THead>
          <TBody>
            {topPages.map((row, i) => <TR key={`${row.page_path}-${i}`}><TD>{row.page_path}</TD><TD>{row.pageviews}</TD><TD>{row.sessions}</TD></TR>)}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
