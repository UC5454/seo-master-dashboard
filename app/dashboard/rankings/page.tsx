"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type RankingRow = {
  keyword: string;
  date: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  delta: number;
};

export default function RankingsPage() {
  const [period, setPeriod] = useState("30");
  const [items, setItems] = useState<RankingRow[]>([]);

  const load = async (days: string) => {
    const res = await fetch(`/api/rankings?days=${days}`, { cache: "no-store" });
    const data = await res.json();
    setItems(data.items ?? []);
  };

  useEffect(() => {
    void load(period);
  }, [period]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>順位推移</CardTitle>
          <Select className="w-40" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7">7日</option>
            <option value="30">30日</option>
            <option value="90">90日</option>
          </Select>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={items.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis reversed />
              <Tooltip />
              <Line dataKey="position" stroke="#2C5282" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">GSCテーブル</CardTitle>
        <div className="overflow-x-auto">
          <Table>
            <THead><TR><TH>keyword</TH><TH>position</TH><TH>impressions</TH><TH>clicks</TH><TH>CTR</TH><TH>変動</TH></TR></THead>
            <TBody>
              {items.map((item, i) => (
                <TR key={`${item.keyword}-${item.date}-${i}`}>
                  <TD>{item.keyword}</TD><TD>{item.position.toFixed(1)}</TD><TD>{item.impressions}</TD><TD>{item.clicks}</TD><TD>{(item.ctr * 100).toFixed(1)}%</TD>
                  <TD>
                    {Math.abs(item.delta) >= 5 ? (
                      <Badge className={item.delta < 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {item.delta > 0 ? "+" : ""}{item.delta.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
