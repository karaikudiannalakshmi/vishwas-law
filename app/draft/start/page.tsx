"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/AuthContext";
import { watchCases } from "@/lib/cases";
import { Case } from "@/lib/types";

function StartInner() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"choose" | "existing">("choose");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = watchCases(user.uid, (c) => {
      setCases(c);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (mode === "choose") {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">New brief</h1>
        <p className="text-slate-600 mb-8">
          Is this for a case you already have on file, or a brand-new matter
          with no reference yet?
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("existing")}
            className="text-left rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400 hover:shadow-sm transition"
          >
            <h3 className="font-medium text-slate-900 mb-1">Existing case</h3>
            <p className="text-sm text-slate-600">
              Continue a case already tracked here — pull in its facts,
              parties, and past drafts.
            </p>
          </button>
          <Link
            href="/draft/quick"
            className="text-left rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400 hover:shadow-sm transition"
          >
            <h3 className="font-medium text-slate-900 mb-1">New matter</h3>
            <p className="text-sm text-slate-600">
              Nothing on file yet — e.g. a fresh Income Tax appeal or a new
              lower-court filing. Just answer facts and questions, and get a
              brief.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setMode("choose")}
        className="text-sm text-slate-500 hover:underline mb-4"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-semibold mb-4">Pick the case</h1>
      {loading && <p className="text-slate-500 text-sm">Loading…</p>}
      {!loading && cases.length === 0 && (
        <p className="text-slate-500 text-sm">
          You don&apos;t have any tracked cases yet.{" "}
          <Link href="/cases/new" className="underline">
            Create one
          </Link>{" "}
          or start a{" "}
          <Link href="/draft/quick" className="underline">
            new matter
          </Link>{" "}
          instead.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/draft/${c.id}`}
            className="rounded-md border border-slate-200 bg-white p-3 hover:border-slate-400 text-sm"
          >
            <span className="font-medium">{c.title}</span>
            <span className="text-slate-500"> — {c.court}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DraftStartPage() {
  return (
    <RequireAuth>
      <StartInner />
    </RequireAuth>
  );
}
