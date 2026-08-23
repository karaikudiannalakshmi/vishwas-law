"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, resendVerificationEmail, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading…</p>;
  }
  if (!user) {
    return null;
  }

  if (!user.emailVerified) {
    return (
      <div className="max-w-md mx-auto mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
        <h2 className="font-semibold text-slate-900 mb-2">Confirm your email</h2>
        <p className="text-sm text-slate-600 mb-4">
          We sent a confirmation link to <strong>{user.email}</strong>. Click
          it, then come back here — case data stays hidden until your email
          is verified.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={async () => {
              setChecking(true);
              await refreshUser();
              setChecking(false);
            }}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white font-medium hover:bg-slate-700 disabled:opacity-50"
            disabled={checking}
          >
            {checking ? "Checking…" : "I've verified, check again"}
          </button>
          <button
            onClick={async () => {
              await resendVerificationEmail();
              setSent(true);
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-white"
          >
            Resend email
          </button>
        </div>
        {sent && (
          <p className="text-xs text-emerald-700 mt-3">Verification email sent again.</p>
        )}
        <button
          onClick={() => logout()}
          className="mt-4 text-xs text-slate-500 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
