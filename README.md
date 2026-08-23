# Vishwa's Law

A private case-tracking and grounded-drafting assistant for a small circle of
practising lawyers. Built with Next.js, Firebase (Auth, Firestore, Storage),
and the Indian Kanoon API for citations.

This is a friends-and-family tool, not a commercial product — it's designed
to be self-hosted (free tier) by you and used by people you invite, not sold.

## What it does

- **Case tracking** — create a case (civil / criminal / constitutional),
  record which side you're on, track hearings and next dates, and upload
  case documents.
- **Grounded drafting** — a structured form (facts, arguments, relief
  sought) plus a live citation search. Citations are only ever pulled from
  a real API response, quoted with their source URL — the app never asks
  an AI model to "recall" a case, which is the main fix for the
  hallucination problem you were seeing with general-purpose chatbots.
- **Private by default** — sign-in required (Firebase Auth); each account
  only sees cases it created. See "Sharing cases with your friends" below
  if you want a firm-wide shared view instead.

## 1. Prerequisites

- Node.js 18+ and npm
- A free Google/Firebase account
- A free Indian Kanoon API account (for live citation search)
- A GitHub account and a Vercel account (both free tiers are enough)

## 2. Set up Firebase (free "Spark" plan is enough to start)

1. Go to https://console.firebase.google.com → **Add project** → give it a
   name (e.g. `vishwas-law`).
2. In the new project, go to **Build → Authentication → Get started**,
   enable the **Email/Password** sign-in method.
3. Go to **Build → Firestore Database → Create database**, start in
   **production mode**, pick a region close to India (e.g.
   `asia-south1`).
4. Go to **Build → Storage → Get started**, same region.
5. Go to **Project settings (gear icon) → General → Your apps → Add app →
   Web (</>)**. Register the app (no need for Firebase Hosting). Copy the
   `firebaseConfig` values shown — you'll need them in step 4 below.
6. Deploy the included security rules so only a case's creator can read or
   write it:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # point at the existing project; keep default rule file names, or point at firestore.rules / storage.rules in this repo
   firebase deploy --only firestore:rules,storage:rules
   ```
   (If you'd rather do this by hand: paste the contents of `firestore.rules`
   into Firestore → Rules in the console, and `storage.rules` into
   Storage → Rules, then Publish.)

## 3. Get an Indian Kanoon API key

1. Sign up at https://api.indiankanoon.org (separate from the main
   indiankanoon.org site).
2. You get ₹500 of free credit immediately; you can also apply for the
   ₹10,000/month free non-commercial tier, which fits this use case — the
   site will ask what the usage is for.
3. Copy your API token from the dashboard.

Pricing (subject to change, see the API's own pricing page): roughly
₹0.50 per search, ₹0.20 per document fetched, ₹0.05 per fragment — cheap
at the volume a handful of lawyers would generate, but not literally free
once you're past the monthly allowance.

## 4. Configure the app

```bash
cd vishwas-law
cp .env.local.example .env.local
```

Fill in `.env.local` with:
- The six `NEXT_PUBLIC_FIREBASE_*` values from Firebase step 5 above.
- `INDIANKANOON_API_KEY` from step 3 above.

Then install and run locally:

```bash
npm install
npm run dev
```

Visit http://localhost:3000, sign up with an email/password, and try
creating a case.

## 5. Deploy so your friends can use it (GitHub + Vercel)

1. Create a new empty repo on GitHub, then from this folder:
   ```bash
   git remote add origin https://github.com/<you>/vishwas-law.git
   git branch -M main
   git push -u origin main
   ```
2. Go to https://vercel.com → **Add New → Project** → import that GitHub
   repo. Vercel auto-detects Next.js.
3. Before deploying, add the same environment variables from your
   `.env.local` (the 6 Firebase ones + `INDIANKANOON_API_KEY`) under
   **Project Settings → Environment Variables**.
4. Deploy. You'll get a `https://vishwas-law-xxxx.vercel.app` URL — share
   that with your lawyer friends and have each of them sign up.

## 6. Sharing cases with your friends (optional)

Right now, by design, each account only sees the cases *it* created —
that's the safest default for sensitive case data. If instead you want
everyone in your circle to see a shared pool of cases (e.g. all cases
belonging to the firm rather than the individual who typed them in),
the simplest change is:

- Add a `firmId` field to each case instead of relying solely on
  `createdBy`.
- Update `firestore.rules` to check `resource.data.firmId in
  get(/databases/$(database)/documents/firms/$(firmId)).data.members`
  (i.e. maintain a `firms/{firmId}` document listing member UIDs).

This is a deliberate manual step rather than a default, since it changes
who can see what — worth deciding together with your friends first.

## Notes on the anti-hallucination design

- The `/api/citations` route only ever returns what the Indian Kanoon API
  actually found for a search — it never asks a language model to write a
  citation from memory.
- Every citation inserted into a draft carries its source URL, so it's a
  one-click check for whoever reviews the draft.
- Every generated draft is explicitly marked "not filing-ready" until an
  advocate reviews it — this isn't just a UX nicety: India's draft
  2026 AI-in-courts framework is clear that responsibility for a filing
  stays with the advocate, not the tool, so keeping that review step
  visible and undeniable in the product is worth preserving even as you
  extend this further.

## What's intentionally left out of this first version

- Legal-opinion / title-collateral module (Module B from the original
  concept note) — not built yet; the drafting module was the priority.
- Search of SCC Online (no public API exists) and eCourts/Judis (no public
  API found either) — Indian Kanoon is the only source wired up for now.
- Rich text / PDF export of drafts — currently a plain-text preview, saved
  as text in Firestore. Worth adding a "download as .docx" step before
  anyone actually files something drafted here.
