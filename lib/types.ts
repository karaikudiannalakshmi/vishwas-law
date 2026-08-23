export type CaseType = "civil" | "criminal" | "constitutional";

export type OurSide =
  | "petitioner"
  | "respondent"
  | "plaintiff"
  | "defendant"
  | "prosecution"
  | "accused/defence"
  | "appellant"
  | "opponent";

export type CaseStatus = "active" | "adjourned" | "reserved" | "disposed" | "closed";

export interface Case {
  id: string;
  title: string;
  caseType: CaseType;
  court: string;
  caseNumber?: string;
  ourSide: OurSide;
  ourParty: string;
  opposingParty: string;
  status: CaseStatus;
  nextHearingDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Hearing {
  id: string;
  date: string;
  purpose: string;
  notes: string;
  nextDate?: string;
  createdAt: number;
}

export interface CaseDocument {
  id: string;
  name: string;
  url: string;
  path: string;
  contentType: string;
  size: number;
  uploadedAt: number;
  uploadedBy: string;
}

export interface Citation {
  title: string;
  docId: string;
  court?: string;
  date?: string;
  url: string;
  snippet: string;
}

export interface Draft {
  id: string;
  filingType: string;
  facts: string;
  reliefsSought: string;
  ourArguments: string;
  citations: Citation[];
  content: string;
  createdBy: string;
  createdAt: number;
  reviewed: boolean;
}
