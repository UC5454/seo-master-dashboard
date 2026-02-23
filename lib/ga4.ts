const GA4_ENDPOINT = "https://analyticsdata.googleapis.com/v1beta";

type Ga4Body = {
  dateRanges: Array<{ startDate: string; endDate: string }>;
  metrics: Array<{ name: string }>;
  dimensions?: Array<{ name: string }>;
  limit?: string;
};

export async function runGa4Report(propertyId: string, body: Ga4Body) {
  const token = process.env.GA4_ACCESS_TOKEN;
  if (!token) throw new Error("GA4_ACCESS_TOKEN is not configured.");

  const res = await fetch(`${GA4_ENDPOINT}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GA4 API error: ${res.status}`);
  }

  return res.json();
}
