"use client";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";
import { Case, Hearing, CaseDocument, Draft } from "./types";

// --- Cases ---

export function watchCases(
  userId: string,
  cb: (cases: Case[]) => void
) {
  const q = query(
    collection(db, "cases"),
    where("createdBy", "==", userId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Case)));
  });
}

export async function createCase(
  data: Omit<Case, "id" | "createdAt" | "updatedAt">
) {
  const now = Date.now();
  const docRef = await addDoc(collection(db, "cases"), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getCase(caseId: string): Promise<Case | null> {
  const snap = await getDoc(doc(db, "cases", caseId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Case;
}

export function watchCase(caseId: string, cb: (c: Case | null) => void) {
  return onSnapshot(doc(db, "cases", caseId), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Case) : null);
  });
}

export async function updateCase(caseId: string, data: Partial<Case>) {
  await updateDoc(doc(db, "cases", caseId), { ...data, updatedAt: Date.now() });
}

export async function deleteCase(caseId: string) {
  await deleteDoc(doc(db, "cases", caseId));
}

// --- Hearings (subcollection) ---

export function watchHearings(caseId: string, cb: (h: Hearing[]) => void) {
  const q = query(
    collection(db, "cases", caseId, "hearings"),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hearing)));
  });
}

export async function addHearing(
  caseId: string,
  hearing: Omit<Hearing, "id" | "createdAt">
) {
  await addDoc(collection(db, "cases", caseId, "hearings"), {
    ...hearing,
    createdAt: Date.now(),
  });
  if (hearing.nextDate) {
    await updateCase(caseId, { nextHearingDate: hearing.nextDate });
  }
}

// --- Documents (subcollection + Storage) ---

export function watchDocuments(caseId: string, cb: (docs: CaseDocument[]) => void) {
  const q = query(
    collection(db, "cases", caseId, "documents"),
    orderBy("uploadedAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CaseDocument)));
  });
}

export async function uploadCaseDocument(
  caseId: string,
  file: File,
  uploadedBy: string
) {
  const path = `cases/${caseId}/documents/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await addDoc(collection(db, "cases", caseId, "documents"), {
    name: file.name,
    url,
    path,
    contentType: file.type,
    size: file.size,
    uploadedAt: Date.now(),
    uploadedBy,
  });
}

export async function deleteCaseDocument(caseId: string, document: CaseDocument) {
  await deleteObject(ref(storage, document.path)).catch(() => {
    // ignore if already gone from storage
  });
  await deleteDoc(doc(db, "cases", caseId, "documents", document.id));
}

// --- Drafts (subcollection) ---

export function watchDrafts(caseId: string, cb: (d: Draft[]) => void) {
  const q = query(
    collection(db, "cases", caseId, "drafts"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Draft)));
  });
}

export async function saveDraft(
  caseId: string,
  draft: Omit<Draft, "id" | "createdAt">
) {
  await addDoc(collection(db, "cases", caseId, "drafts"), {
    ...draft,
    createdAt: Date.now(),
  });
}

export const _unused = Timestamp; // keep import if needed later
