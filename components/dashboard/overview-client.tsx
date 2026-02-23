"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type OverviewProps = {
  totalArticles: number;
  monthlyPv: number;
  avgRank: number;
  aioRate: number;
  statusData: Array<{ status: string; count: number }>;
  activities: Array<{ id: string; label: string; date: string }>;
};

export function OverviewClient({ totalArticles, monthlyPv, avgRank, aioRate, statusData, activities }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardDescription>総記事数</CardDescription><CardTitle>{totalArticles}</CardTitle></Card>
        <Card><CardDescription>月間PV</CardDescription><CardTitle>{monthlyPv.toLocaleString()}</CardTitle></Card>
        <Card><CardDescription>平均順位</CardDescription><CardTitle>{avgRank.toFixed(1)}</CardTitle></Card>
        <Card><CardDescription>AIO引用率</CardDescription><CardTitle>{aioRate.toFixed(1)}%</CardTitle></Card>
      </div>

      <Card>
        <CardTitle className="mb-4">記事ステータス</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2C5282" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">最新アクティビティ</CardTitle>
        <ul className="space-y-2">
          {activities.map((item) => (
            <li key={item.id} className="rounded-lg border bg-slate-50 p-3 text-sm">
              <p>{item.label}</p>
              <p className="text-xs text-slate-500">{item.date}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
