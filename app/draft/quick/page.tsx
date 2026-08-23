"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import CitationSearch from "@/components/CitationSearch";
import { useAuth } from "@/lib/AuthContext";
import { saveBrief, promoteBriefToCase } from "@/lib/briefs";
import { Citation, CaseType, OurSide, QuickBrief } from "@/lib/types";

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "constitutional", label: "Constitutional / Writ" },
  { value: "income-tax-appeal", label: "Income Tax Appeal" },
  { value: "other-tribunal-appeal", label: "Other Tribunal Appeal" },
];

function QuickBriefInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [matterTitle, setMatterTitle] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("civil");
  const [facts, setFacts] = useState("");
  const [legalQueries, setLegalQueries] = useState("");
  const [ourArguments, setOurArguments] = useState("");
  const [reliefsSought, setReliefsSought] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [generated, setGenerated] = useState<string | null>(null);
  const [savedBrief, setSavedBrief] = useState<QuickBrief | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPromote, setShowPromote] = useState(false);

  const addCitation = (cit: Citation) => {
    if (citations.some((x) => x.docId === cit.docId)) return;
    setCitations([...citations, cit]);
  };
  const removeCitation = (docId: string) => {
    setCitations(citations.filter((c) => c.docId !== docId));
  };

  const generate = () => {
    const lines: string[] = [];
    lines.push(`PRELIMINARY BRIEF — ${matterTitle || "Untitled matter"}`);
    lines.push(`(${CASE_TYPES.find((t) => t.value === caseType)?.label})`);
    lines.push("");
    lines.push(
      "No case has been filed/tracked for this matter yet — this brief is based only on the facts and questions below."
    );
    lines.push("");
    lines.push("1. FACTS AS UNDERSTOOD");
    lines.push(facts || "[Facts to be filled in]");
    lines.push("");
    lines.push("2. QUESTIONS TO BE ADDRESSED");
    lines.push(legalQueries || "[Questions to be filled in]");
    lines.push("");
    lines.push("3. PRELIMINARY ANALYSIS");
    lines.push(ourArguments || "[Analysis to be filled in]");
    if (citations.length > 0) {
      lines.push("");
      lines.push("Relevant authorities found:");
      citations.forEach((cit, i) => {
        lines.push(
          `   (${i + 1}) ${cit.title}${cit.court ? `, ${cit.court}` : ""}${
            cit.date ? ` (${cit.date})` : ""
          } — ${cit.url}`
        );
      });
    }
    if (reliefsSought.trim()) {
      lines.push("");
      lines.push("4. LIKELY RELIEF / NEXT STEPS");
      lines.push(reliefsSought);
    }
    lines.push("");
    lines.push(
      "--- DRAFT ONLY: every citation above was fetched live and must be independently verified; this brief has not been reviewed by an advocate and is not a court filing. ---"
    );
    setGenerated(lines.join("\n"));
  };

  const save = async () => {
    if (!user || !generated) return;
    setSaving(true);
    const data = {
      matterTitle: matterTitle || "Untitled matter",
      caseType,
      facts,
      legalQueries,
      ourArguments,
      reliefsSought,
      citations,
      content: generated,
      createdBy: user.uid,
      reviewed: false,
    };
    const id = await saveBrief(data);
    setSavedBrief({ id, createdAt: Date.now(), ...data });
    setSaving(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">New matter — quick brief</h1>
        <p className="text-sm text-slate-500 mb-6">
          No case record needed yet. Answer the facts and the questions you
          want addressed; citations only come from the live search on the
          right.
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Matter title (working name)">
            <input
              value={matterTitle}
              onChange={(e) => setMatterTitle(e.target.value)}
              className="input"
              placeholder="e.g. Ramesh — AY 2023-24 disallowance appeal"
            />
          </Field>

          <Field label="Type">
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as CaseType)}
              className="input"
            >
              {CASE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Facts as you understand them">
            <textarea
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="input min-h-[120px]"
              placeholder="What happened, in order — assessment year, order appealed against, dates, amounts, etc."
            />
          </Field>

          <Field label="Legal queries — what you want addressed">
            <textarea
              value={legalQueries}
              onChange={(e) => setLegalQueries(e.target.value)}
              className="input min-h-[100px]"
              placeholder="e.g. Is the disallowance under Sec 40(a)(ia) sustainable given TDS was deposited before the return due date?"
            />
          </Field>

          <Field label="Your preliminary view / arguments">
            <textarea
              value={ourArguments}
              onChange={(e) => setOurArguments(e.target.value)}
              className="input min-h-[100px]"
            />
          </Field>

          <Field label="Likely relief / next steps (optional)">
            <textarea
              value={reliefsSought}
              onChange={(e) => setReliefsSought(e.target.value)}
              className="input min-h-[70px]"
            />
          </Field>

          {citations.length > 0 && (
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Citations added ({citations.length})
              </span>
              <ul className="flex flex-col gap-1">
                {citations.map((c) => (
                  <li
                    key={c.docId}
                    className="flex items-center justify-between text-sm rounded-md border border-slate-200 px-2 py-1"
                  >
                    <span className="truncate">{c.title}</span>
                    <button
                      onClick={() => removeCitation(c.docId)}
                      className="text-xs text-red-600 hover:underline shrink-0 ml-2"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={generate}
            className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700"
          >
            Generate brief
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <CitationSearch onAdd={addCitation} />
        {generated && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Brief preview</h3>
              {!savedBrief ? (
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white font-medium hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              ) : (
                <span className="text-xs text-emerald-700">Saved</span>
              )}
            </div>
            <pre className="whitespace-pre-wrap text-xs text-slate-800 font-mono bg-slate-50 rounded-md p-3 max-h-[500px] overflow-auto">
              {generated}
            </pre>
            {savedBrief && !savedBrief.promotedToCaseId && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                {!showPromote ? (
                  <button
                    onClick={() => setShowPromote(true)}
                    className="text-xs text-slate-600 underline"
                  >
                    This is becoming a real filing — turn it into a tracked
                    case
                  </button>
                ) : (
                  <PromoteForm
                    brief={savedBrief}
                    caseType={caseType}
                    onDone={(caseId) => router.push(`/cases/${caseId}`)}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PromoteForm({
  brief,
  caseType,
  onDone,
}: {
  brief: QuickBrief;
  caseType: CaseType;
  onDone: (caseId: string) => void;
}) {
  const [court, setCourt] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [ourSide, setOurSide] = useState<OurSide>("appellant");
  const [ourParty, setOurParty] = useState("");
  const [opposingParty, setOpposingParty] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const caseId = await promoteBriefToCase(
      { ...brief, caseType },
      { court, caseNumber, ourSide, ourParty, opposingParty }
    );
    setBusy(false);
    onDone(caseId);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mt-2">
      <input
        required
        placeholder="Court / forum (e.g. ITAT Chennai)"
        value={court}
        onChange={(e) => setCourt(e.target.value)}
        className="input"
      />
      <input
        placeholder="Case / appeal number (if any)"
        value={caseNumber}
        onChange={(e) => setCaseNumber(e.target.value)}
        className="input"
      />
      <input
        required
        placeholder="Our party's name"
        value={ourParty}
        onChange={(e) => setOurParty(e.target.value)}
        className="input"
      />
      <input
        required
        placeholder="Opposing party's name"
        value={opposingParty}
        onChange={(e) => setOpposingParty(e.target.value)}
        className="input"
      />
      <select
        value={ourSide}
        onChange={(e) => setOurSide(e.target.value as OurSide)}
        className="input"
      >
        {["appellant", "respondent", "petitioner", "opponent"].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {busy ? "Creating case…" : "Create tracked case from this brief"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function QuickBriefPage() {
  return (
    <RequireAuth>
      <QuickBriefInner />
    </RequireAuth>
  );
}
