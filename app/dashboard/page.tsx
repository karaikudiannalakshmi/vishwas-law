"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/AuthContext";
import { watchCases } from "@/lib/cases";
import { watchBriefs } from "@/lib/briefs";
import { Case, QuickBrief } from "@/lib/types";

function DashboardInner() {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [briefs, setBriefs] = useState<QuickBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub1 = watchCases(user.uid, (c) => {
      setCases(c);
      setLoading(false);
    });
    const unsub2 = watchBriefs(user.uid, setBriefs);
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const unpromotedBriefs = briefs.filter((b) => !b.promotedToCaseId);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your cases</h1>
          <div className="flex gap-2">
            <Link
              href="/draft/start"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700"
            >
              + New brief
            </Link>
            <Link
              href="/cases/new"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              + New case
            </Link>
          </div>
        </div>

        {loading && <p className="text-slate-500 text-sm">Loading…</p>}

        {!loading && cases.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No cases yet. Start a <strong>New brief</strong> if this is a
            fresh matter with no reference yet, or <strong>New case</strong>{" "}
            to set up full tracking (hearings, documents, drafts) right away.
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
                  {c.caseType.replace(/-/g, " ")}
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

      {unpromotedBriefs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Quick briefs <span className="text-slate-400 font-normal">(not yet a tracked case)</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpromotedBriefs.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {b.caseType.replace(/-/g, " ")}
                </span>
                <h3 className="font-medium text-slate-900 mt-1 mb-1">
                  {b.matterTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(b.createdAt).toLocaleDateString("en-IN")} ·{" "}
                  {b.citations.length} citation{b.citations.length !== 1 && "s"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
