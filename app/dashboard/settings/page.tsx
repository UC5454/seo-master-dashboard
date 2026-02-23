"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Settings = Record<string, { apiKey?: string; folderId?: string; domains?: string[]; keywords?: string[] }>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});

  const [ahrefs, setAhrefs] = useState("");
  const [gsc, setGsc] = useState("");
  const [ga4, setGa4] = useState("");
  const [similarweb, setSimilarweb] = useState("");
  const [gdocsFolder, setGdocsFolder] = useState("");
  const [domain, setDomain] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSettings(d.items ?? {}));
  }, []);

  const save = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ahrefs: { apiKey: ahrefs },
        gsc: { apiKey: gsc },
        ga4: { apiKey: ga4 },
        similarweb: { apiKey: similarweb },
        gdocs: { folderId: gdocsFolder },
        tracking: { domains: domain ? [domain] : [], keywords: keyword ? [keyword] : [] },
      }),
    });
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    setSettings(data.items ?? {});
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardTitle className="mb-3">API連携設定</CardTitle>
        <div className="space-y-2">
          <Input placeholder="Ahrefs API Key" value={ahrefs} onChange={(e) => setAhrefs(e.target.value)} />
          <Input placeholder="GSC Access Token" value={gsc} onChange={(e) => setGsc(e.target.value)} />
          <Input placeholder="GA4 Access Token" value={ga4} onChange={(e) => setGa4(e.target.value)} />
          <Input placeholder="SimilarWeb API Key" value={similarweb} onChange={(e) => setSimilarweb(e.target.value)} />
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-3">運用設定</CardTitle>
        <div className="space-y-2">
          <Input placeholder="Google Docs Folder ID" value={gdocsFolder} onChange={(e) => setGdocsFolder(e.target.value)} />
          <Input placeholder="競合ドメイン" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <Input placeholder="トラッキングキーワード" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={save}>保存</Button>
        <pre className="mt-3 overflow-auto rounded-lg border bg-white p-3 text-xs">{JSON.stringify(settings, null, 2)}</pre>
      </div>
    </div>
  );
}
