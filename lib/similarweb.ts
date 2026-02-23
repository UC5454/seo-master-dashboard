const SIMILARWEB_BASE = "https://api.similarweb.com/v1";

async function similarwebRequest<T>(path: string) {
  const key = process.env.SIMILARWEB_API_KEY;
  if (!key) throw new Error("SIMILARWEB_API_KEY is not configured.");

  const res = await fetch(`${SIMILARWEB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${key}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SimilarWeb API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const similarwebApi = {
  traffic: <T>(domain: string) => similarwebRequest<T>(`/website/${domain}/total-traffic-and-engagement/visits`),
  sources: <T>(domain: string) => similarwebRequest<T>(`/website/${domain}/traffic-sources`),
};
