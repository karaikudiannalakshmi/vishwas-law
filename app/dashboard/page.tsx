"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/AuthContext";
import { watchCases } from "@/lib/cases";
import { Case } from "@/lib/types";

function DashboardInner() {
  const { user } = useAuth();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your cases</h1>
        <Link
          href="/cases/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700"
        >
          + New case
        </Link>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading…</p>}

      {!loading && cases.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No cases yet. Create your first one to start tracking hearings,
          documents, and drafts.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {c.caseType}
              </span>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">{c.title}</h3>
            <p className="text-sm text-slate-500 mb-1">{c.court}</p>
            <p className="text-sm text-slate-600">
              {c.ourParty} <span className="text-slate-400">({c.ourSide})</span> vs{" "}
              {c.opposingParty}
            </p>
            {c.nextHearingDate && (
              <p className="text-xs text-slate-500 mt-2">
                Next hearing: {c.nextHearingDate}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Case["status"] }) {
  const colors: Record<Case["status"], string> = {
    active: "bg-emerald-100 text-emerald-800",
    adjourned: "bg-amber-100 text-amber-800",
    reserved: "bg-sky-100 text-sky-800",
    disposed: "bg-slate-200 text-slate-700",
    closed: "bg-slate-200 text-slate-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
