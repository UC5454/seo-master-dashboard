const BASE_URL = "https://api.ahrefs.com/v3";

async function ahrefsRequest<T>(path: string, params?: Record<string, string | number>) {
  const token = process.env.AHREFS_API_KEY;
  if (!token) throw new Error("AHREFS_API_KEY is not configured.");

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Ahrefs API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export const ahrefsApi = {
  keywordsExplorer: <T>(keyword: string, country = "jp") =>
    ahrefsRequest<T>("/keywords-explorer", { keyword, country }),
  siteExplorer: <T>(target: string) => ahrefsRequest<T>("/site-explorer", { target }),
  contentExplorer: <T>(query: string) => ahrefsRequest<T>("/content-explorer", { query }),
};
