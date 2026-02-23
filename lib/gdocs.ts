const DOCS_BASE = "https://docs.googleapis.com/v1";

export async function createGoogleDoc(title: string, content: string) {
  const token = process.env.GOOGLE_DOCS_ACCESS_TOKEN;
  if (!token) throw new Error("GOOGLE_DOCS_ACCESS_TOKEN is not configured.");

  const createRes = await fetch(`${DOCS_BASE}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) throw new Error(`Google Docs create error: ${createRes.status}`);

  const doc = (await createRes.json()) as { documentId: string };

  await fetch(`${DOCS_BASE}/documents/${doc.documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            text: content,
            location: { index: 1 },
          },
        },
      ],
    }),
  });

  return doc.documentId;
}
