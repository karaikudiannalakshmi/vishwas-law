"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/AuthContext";
import { createCase } from "@/lib/cases";
import { CaseType, OurSide } from "@/lib/types";

const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "constitutional", label: "Constitutional / Writ" },
  { value: "income-tax-appeal", label: "Income Tax Appeal" },
  { value: "other-tribunal-appeal", label: "Other Tribunal Appeal" },
];
const SIDES: OurSide[] = [
  "petitioner",
  "respondent",
  "plaintiff",
  "defendant",
  "prosecution",
  "accused/defence",
  "appellant",
  "opponent",
];

function NewCaseInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState<CaseType>("civil");
  const [court, setCourt] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [ourSide, setOurSide] = useState<OurSide>("petitioner");
  const [ourParty, setOurParty] = useState("");
  const [opposingParty, setOpposingParty] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const id = await createCase({
      title,
      caseType,
      court,
      caseNumber,
      ourSide,
      ourParty,
      opposingParty,
      notes,
      status: "active",
      createdBy: user.uid,
    });
    router.push(`/cases/${id}`);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">New case</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Case title / short name">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="e.g. Ramesh vs State of TN"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Case type">
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
          <Field label="Our side">
            <select
              value={ourSide}
              onChange={(e) => setOurSide(e.target.value as OurSide)}
              className="input"
            >
              {SIDES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Court">
            <input
              required
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="input"
              placeholder="e.g. Madras High Court"
            />
          </Field>
          <Field label="Case number (if any)">
            <input
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Our party's name">
            <input
              required
              value={ourParty}
              onChange={(e) => setOurParty(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Opposing party's name">
            <input
              required
              value={opposingParty}
              onChange={(e) => setOpposingParty(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-[100px]"
            placeholder="Brief background, key facts, anything worth remembering"
          />
        </Field>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-700 disabled:opacity-50 self-start"
        >
          {busy ? "Creating…" : "Create case"}
        </button>
      </form>
    </div>
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

export default function NewCasePage() {
  return (
    <RequireAuth>
      <NewCaseInner />
    </RequireAuth>
  );
}
