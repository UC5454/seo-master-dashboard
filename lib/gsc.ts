const GSC_ENDPOINT = "https://searchconsole.googleapis.com/webmasters/v3/sites";

type GscQueryBody = {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
};

export async function queryGsc(siteUrl: string, body: GscQueryBody) {
  const token = process.env.GSC_ACCESS_TOKEN;
  if (!token) throw new Error("GSC_ACCESS_TOKEN is not configured.");

  const res = await fetch(`${GSC_ENDPOINT}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GSC API error: ${res.status}`);
  }

  return res.json();
}
