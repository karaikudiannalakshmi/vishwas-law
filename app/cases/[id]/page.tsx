"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/AuthContext";
import {
  watchCase,
  watchHearings,
  watchDocuments,
  watchDrafts,
  addHearing,
  uploadCaseDocument,
  deleteCaseDocument,
  updateCase,
} from "@/lib/cases";
import { Case, Hearing, CaseDocument, Draft, CaseStatus } from "@/lib/types";

function CaseDetailInner({ caseId }: { caseId: string }) {
  const { user } = useAuth();
  const [c, setC] = useState<Case | null>(null);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    const unsub1 = watchCase(caseId, setC);
    const unsub2 = watchHearings(caseId, setHearings);
    const unsub3 = watchDocuments(caseId, setDocuments);
    const unsub4 = watchDrafts(caseId, setDrafts);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [caseId]);

  if (!c) return <p className="text-slate-500 text-sm">Loading…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
          ← All cases
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold">{c.title}</h1>
            <p className="text-slate-600">
              {c.court} {c.caseNumber && `· ${c.caseNumber}`}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {c.ourParty} ({c.ourSide}) vs {c.opposingParty} · {c.caseType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={c.status}
              onChange={(e) =>
                updateCase(caseId, { status: e.target.value as CaseStatus })
              }
              className="input w-auto"
            >
              {["active", "adjourned", "reserved", "disposed", "closed"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
            <Link
              href={`/draft/${caseId}`}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700 whitespace-nowrap"
            >
              New draft
            </Link>
          </div>
        </div>
        {c.notes && <p className="text-sm text-slate-600 mt-3">{c.notes}</p>}
      </div>

      <HearingsSection caseId={caseId} hearings={hearings} />
      <DocumentsSection caseId={caseId} documents={documents} userEmail={user?.email || ""} />
      <DraftsSection drafts={drafts} />
    </div>
  );
}

function HearingsSection({ caseId, hearings }: { caseId: string; hearings: Hearing[] }) {
  const [date, setDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await addHearing(caseId, { date, purpose, notes, nextDate: nextDate || undefined });
    setDate("");
    setPurpose("");
    setNotes("");
    setNextDate("");
    setBusy(false);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Hearings</h2>
      <form onSubmit={submit} className="grid sm:grid-cols-4 gap-2 mb-4 items-end">
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Date</span>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Purpose</span>
          <input required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="input" placeholder="e.g. arguments" />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Notes / order</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Next date</span>
          <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="input" />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="sm:col-span-4 self-start rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-50"
        >
          {busy ? "Adding…" : "+ Add hearing"}
        </button>
      </form>
      {hearings.length === 0 ? (
        <p className="text-sm text-slate-500">No hearings recorded yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {hearings.map((h) => (
            <li key={h.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
              <span className="font-medium">{h.date}</span> — {h.purpose}
              {h.notes && <p className="text-slate-600 mt-1">{h.notes}</p>}
              {h.nextDate && (
                <p className="text-xs text-slate-500 mt-1">Next: {h.nextDate}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DocumentsSection({
  caseId,
  documents,
  userEmail,
}: {
  caseId: string;
  documents: CaseDocument[];
  userEmail: string;
}) {
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    await uploadCaseDocument(caseId, file, userEmail);
    setBusy(false);
    e.target.value = "";
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Documents</h2>
      <label className="inline-block mb-4 cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
        {busy ? "Uploading…" : "+ Upload document"}
        <input type="file" onChange={onFile} className="hidden" disabled={busy} />
      </label>
      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents uploaded yet.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2">
          {documents.map((d) => (
            <li
              key={d.id}
              className="rounded-md border border-slate-200 bg-white p-3 text-sm flex items-center justify-between gap-2"
            >
              <a href={d.url} target="_blank" rel="noreferrer" className="hover:underline truncate">
                {d.name}
              </a>
              <button
                onClick={() => deleteCaseDocument(caseId, d)}
                className="text-xs text-red-600 hover:underline shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DraftsSection({ drafts }: { drafts: Draft[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Drafts</h2>
      {drafts.length === 0 ? (
        <p className="text-sm text-slate-500">
          No drafts yet. Use &quot;New draft&quot; above to start one.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {drafts.map((d) => (
            <li key={d.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{d.filingType}</span>
                <span className="text-xs text-slate-500">
                  {new Date(d.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {d.citations.length} citation{d.citations.length !== 1 && "s"} ·{" "}
                {d.reviewed ? "Reviewed" : "Not yet reviewed by an advocate"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  return (
    <RequireAuth>
      <CaseDetailInner caseId={id} />
    </RequireAuth>
  );
}
