import { NextRequest, NextResponse } from "next/server";

// Server-side route that calls the Indian Kanoon API and returns REAL,
// retrieved documents only. This route never asks a language model to
// "recall" a citation — it only returns what the API actually found, which
// is the core anti-hallucination guarantee for the drafting workflow.
//
// Docs: https://api.indiankanoon.org/documentation/
// Set INDIANKANOON_API_KEY in your environment (see .env.local.example).

const API_BASE = "https://api.indiankanoon.org";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 3) {
    return NextResponse.json(
      { error: "Provide a search query of at least 3 characters." },
      { status: 400 }
    );
  }

  const apiKey = process.env.INDIANKANOON_API_KEY;
  if (!apiKey || apiKey === "your-indiankanoon-api-key-here") {
    return NextResponse.json(
      {
        error:
          "INDIANKANOON_API_KEY is not configured yet. Sign up at https://api.indiankanoon.org and add your key to .env.local before citation search will work.",
        configured: false,
      },
      { status: 501 }
    );
  }

  try {
    const res = await fetch(
      `${API_BASE}/search/?formInput=${encodeURIComponent(query)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Indian Kanoon API error (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    const results = (data.docs || []).slice(0, 8).map((d: {
      title: string;
      tid: number;
      docsource?: string;
      publishdate?: string;
      headline?: string;
    }) => ({
      title: d.title,
      docId: String(d.tid),
      court: d.docsource,
      date: d.publishdate,
      url: `https://indiankanoon.org/doc/${d.tid}/`,
      // headline is the API's own excerpt containing the query terms -
      // it is quoted verbatim from the source document, not generated.
      snippet: (d.headline || "").replace(/<[^>]+>/g, ""),
    }));

    return NextResponse.json({ results, configured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to reach Indian Kanoon API: ${message}` },
      { status: 502 }
    );
  }
}
