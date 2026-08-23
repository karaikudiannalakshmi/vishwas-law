"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import CitationSearch from "@/components/CitationSearch";
import { useAuth } from "@/lib/AuthContext";
import { getCase, saveDraft } from "@/lib/cases";
import { Case, Citation } from "@/lib/types";

const FILING_TYPES = [
  "Writ Petition",
  "Civil Suit Plaint",
  "Written Statement",
  "Affidavit",
  "Bail Application",
  "Criminal Appeal",
  "Interlocutory Application",
  "Other",
];

function DraftInner({ caseId }: { caseId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [c, setC] = useState<Case | null>(null);
  const [filingType, setFilingType] = useState(FILING_TYPES[0]);
  const [facts, setFacts] = useState("");
  const [reliefsSought, setReliefsSought] = useState("");
  const [ourArguments, setOurArguments] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [generated, setGenerated] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCase(caseId).then(setC);
  }, [caseId]);

  const addCitation = (cit: Citation) => {
    if (citations.some((x) => x.docId === cit.docId)) return;
    setCitations([...citations, cit]);
  };

  const removeCitation = (docId: string) => {
    setCitations(citations.filter((c) => c.docId !== docId));
  };

  const generate = () => {
    if (!c) return;
    const lines: string[] = [];
    lines.push(`IN THE ${c.court.toUpperCase()}`);
    if (c.caseNumber) lines.push(c.caseNumber);
    lines.push("");
    lines.push(`${c.ourParty.toUpperCase()} ... ${labelForSide(c.ourSide, true)}`);
    lines.push("VERSUS");
    lines.push(`${c.opposingParty.toUpperCase()} ... ${labelForSide(c.ourSide, false)}`);
    lines.push("");
    lines.push(`${filingType.toUpperCase()}`);
    lines.push("");
    lines.push("MOST RESPECTFULLY SHOWETH:");
    lines.push("");
    lines.push("1. FACTS OF THE CASE");
    lines.push(facts || "[Facts to be filled in]");
    lines.push("");
    lines.push("2. GROUNDS / ARGUMENTS");
    lines.push(ourArguments || "[Arguments to be filled in]");
    if (citations.length > 0) {
      lines.push("");
      lines.push("In support of the above, reliance is placed on the following authorities:");
      citations.forEach((cit, i) => {
        lines.push(
          `   (${i + 1}) ${cit.title}${cit.court ? `, ${cit.court}` : ""}${
            cit.date ? ` (${cit.date})` : ""
          } — ${cit.url}`
        );
      });
    }
    lines.push("");
    lines.push("3. RELIEF SOUGHT");
    lines.push(
      "In view of the facts and grounds set out above, it is most respectfully prayed that this Hon'ble Court may be pleased to:"
    );
    lines.push(reliefsSought || "[Reliefs to be filled in]");
    lines.push("");
    lines.push(
      "AND FOR THIS ACT OF KINDNESS, THE PETITIONER/APPLICANT SHALL AS IN DUTY BOUND, EVER PRAY."
    );
    lines.push("");
    lines.push("[ADVOCATE FOR THE " + labelForSide(c.ourSide, true).toUpperCase() + "]");
    lines.push("");
    lines.push(
      "--- DRAFT ONLY: every citation above was fetched live and must be independently verified; this document has not been reviewed by an advocate and is not filing-ready. ---"
    );
    setGenerated(lines.join("\n"));
  };

  const save = async () => {
    if (!user || !generated) return;
    setSaving(true);
    await saveDraft(caseId, {
      filingType,
      facts,
      reliefsSought,
      ourArguments,
      citations,
      content: generated,
      createdBy: user.uid,
      reviewed: false,
    });
    setSaving(false);
    router.push(`/cases/${caseId}`);
  };

  if (!c) return <p className="text-slate-500 text-sm">Loading…</p>;

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">New draft — {c.title}</h1>
        <p className="text-sm text-slate-500 mb-6">
          Fill in the structured fields below. Citations are only added from
          the live search on the right — nothing here is written from
          memory.
        </p>

        <div className="flex flex-col gap-4">
          <Field label="Filing type">
            <select value={filingType} onChange={(e) => setFilingType(e.target.value)} className="input">
              {FILING_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Facts of the case">
            <textarea
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Chronological facts relevant to this filing"
            />
          </Field>

          <Field label="Our arguments / grounds">
            <textarea
              value={ourArguments}
              onChange={(e) => setOurArguments(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Legal grounds supporting our side"
            />
          </Field>

          <Field label="Relief sought">
            <textarea
              value={reliefsSought}
              onChange={(e) => setReliefsSought(e.target.value)}
              className="input min-h-[80px]"
              placeholder="What you're asking the court to do"
            />
          </Field>

          {citations.length > 0 && (
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1">
                Citations added ({citations.length})
              </span>
              <ul className="flex flex-col gap-1">
                {citations.map((c2) => (
                  <li
                    key={c2.docId}
                    className="flex items-center justify-between text-sm rounded-md border border-slate-200 px-2 py-1"
                  >
                    <span className="truncate">{c2.title}</span>
                    <button
                      onClick={() => removeCitation(c2.docId)}
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
            Generate draft
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <CitationSearch onAdd={addCitation} />
        {generated && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-900">Draft preview</h3>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white font-medium hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save to case"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-slate-800 font-mono bg-slate-50 rounded-md p-3 max-h-[500px] overflow-auto">
              {generated}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function labelForSide(side: string, isOurs: boolean): string {
  const pairs: Record<string, [string, string]> = {
    petitioner: ["PETITIONER", "RESPONDENT"],
    respondent: ["RESPONDENT", "PETITIONER"],
    plaintiff: ["PLAINTIFF", "DEFENDANT"],
    defendant: ["DEFENDANT", "PLAINTIFF"],
    prosecution: ["PROSECUTION", "ACCUSED"],
    "accused/defence": ["ACCUSED", "COMPLAINANT"],
    appellant: ["APPELLANT", "RESPONDENT"],
    opponent: ["RESPONDENT", "APPLICANT"],
  };
  const pair = pairs[side] || ["PARTY", "OPPOSITE PARTY"];
  return isOurs ? pair[0] : pair[1];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function DraftPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = usePromise(params);
  return (
    <RequireAuth>
      <DraftInner caseId={caseId} />
    </RequireAuth>
  );
}
