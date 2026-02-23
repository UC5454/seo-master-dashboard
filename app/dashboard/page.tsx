import { OverviewClient } from "@/components/dashboard/overview-client";
import { requireSupabaseAdmin } from "@/lib/supabase";

export default async function DashboardOverviewPage() {
  let totalArticles = 0;
  let monthlyPv = 0;
  let avgRank = 0;
  let aioRate = 0;
  let statusData: Array<{ status: string; count: number }> = [];
  let activities: Array<{ id: string; label: string; date: string }> = [];

  try {
    const db = requireSupabaseAdmin();

    const [articlesRes, rankRes, aioRes, analyticsRes] = await Promise.all([
      db.from("articles").select("id,status,title,created_at"),
      db.from("rank_history").select("position").not("position", "is", null),
      db.from("aio_citations").select("id,cited"),
      db.from("analytics_snapshots").select("pageviews"),
    ]);

    const articles = articlesRes.data ?? [];
    const rankings = rankRes.data ?? [];
    const aio = aioRes.data ?? [];
    const analytics = analyticsRes.data ?? [];

    totalArticles = articles.length;
    monthlyPv = analytics.reduce((sum, row) => sum + (row.pageviews ?? 0), 0);
    avgRank = rankings.length
      ? rankings.reduce((sum, row) => sum + (row.position ?? 0), 0) / rankings.length
      : 0;
    const cited = aio.filter((item) => item.cited).length;
    aioRate = aio.length ? (cited / aio.length) * 100 : 0;

    const statusMap = new Map<string, number>();
    for (const article of articles) {
      statusMap.set(article.status, (statusMap.get(article.status) ?? 0) + 1);
    }

    statusData = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));
    activities = articles
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        label: `記事作成: ${item.title}`,
        date: new Date(item.created_at).toLocaleString("ja-JP"),
      }));
  } catch {
    // Keep empty fallback values so UI still renders without env setup.
  }

  return (
    <OverviewClient
      totalArticles={totalArticles}
      monthlyPv={monthlyPv}
      avgRank={avgRank}
      aioRate={aioRate}
      statusData={statusData}
      activities={activities}
    />
  );
}
