"use client";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { createCase } from "./cases";
import { QuickBrief, Case } from "./types";

// Quick briefs live in a top-level collection (not nested under a case)
// because a new matter often starts with no case record at all - see
// firestore.rules for the matching "briefs" security rule.

export function watchBriefs(userId: string, cb: (briefs: QuickBrief[]) => void) {
  const q = query(
    collection(db, "briefs"),
    where("createdBy", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuickBrief)));
  });
}

export async function saveBrief(
  data: Omit<QuickBrief, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "briefs"), {
    ...data,
    createdAt: Date.now(),
  });
  return docRef.id;
}

// Turns a one-off brief into a properly tracked case (so hearings and
// documents can be added going forward), and remembers the link back.
export async function promoteBriefToCase(
  brief: QuickBrief,
  extra: Pick<Case, "court" | "ourSide" | "ourParty" | "opposingParty" | "caseNumber">
): Promise<string> {
  const caseId = await createCase({
    title: brief.matterTitle,
    caseType: brief.caseType,
    court: extra.court,
    caseNumber: extra.caseNumber,
    ourSide: extra.ourSide,
    ourParty: extra.ourParty,
    opposingParty: extra.opposingParty,
    status: "active",
    notes: brief.facts,
    createdBy: brief.createdBy,
  });
  await updateDoc(doc(db, "briefs", brief.id), { promotedToCaseId: caseId });
  return caseId;
}
