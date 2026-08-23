"use client";

import { useState } from "react";
import { Citation } from "@/lib/types";

export default function CitationSearch({
  onAdd,
}: {
  onAdd: (c: Citation) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Citation[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const search = async () => {
    if (q.trim().length < 3) return;
    setBusy(true);
    setError(null);
    setNotConfigured(false);
    try {
      const res = await fetch(`/api/citations?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Search failed");
        if (data.configured === false) setNotConfigured(true);
        setResults([]);
        return;
      }
      setResults(data.results || []);
    } catch {
      setError("Could not reach the citation search service.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-medium text-slate-900 mb-2">
        Search real citations (Indian Kanoon)
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        Only judgments actually returned by the API can be added to your
        draft — nothing here is generated from memory.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. anticipatory bail Section 438 CrPC"
          className="input"
        />
        <button
          onClick={search}
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700 disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Searching…" : "Search"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-3">
          {error}
          {notConfigured && (
            <>
              {" "}
              See the README for how to get a free Indian Kanoon API key.
            </>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {results.map((r) => (
          <li
            key={r.docId}
            className="border border-slate-200 rounded-md p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-900 hover:underline"
                >
                  {r.title}
                </a>
                <p className="text-xs text-slate-500">
                  {r.court} {r.date ? `· ${r.date}` : ""}
                </p>
                {r.snippet && (
                  <p
                    className="text-xs text-slate-600 mt-1"
                    dangerouslySetInnerHTML={{ __html: r.snippet }}
                  />
                )}
              </div>
              <button
                onClick={() => onAdd(r)}
                className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
              >
                Add to draft
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
