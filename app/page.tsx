"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="flex flex-col items-center text-center gap-8 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
        Vishwa&apos;s Law
      </h1>
      <p className="max-w-xl text-slate-600 text-lg">
        A private case-tracking and drafting assistant for a small circle of
        practising lawyers. Every citation is fetched from a real source
        before it&apos;s used &mdash; nothing is invented.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full text-left">
        <FeatureCard
          title="Case tracking"
          body="Store case history, hearing dates, status, and documents per case, in one place."
        />
        <FeatureCard
          title="Grounded drafting"
          body="Structured Q&A produces a draft petition or affidavit skeleton with citations pulled live, never guessed."
        />
        <FeatureCard
          title="Private to your circle"
          body="Sign-in required; only people you invite can see your firm's cases."
        />
      </div>
      {!loading && !user && (
        <Link
          href="/login"
          className="mt-4 rounded-md bg-slate-900 px-5 py-2.5 text-white font-medium hover:bg-slate-700"
        >
          Sign in to continue
        </Link>
      )}
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}
