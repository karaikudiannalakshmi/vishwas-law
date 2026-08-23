"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function NavBar() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight text-slate-900">
          Vishwa&apos;s Law
        </Link>
        {!loading && (
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
                  Cases
                </Link>
                <span className="text-slate-400">{user.displayName || user.email}</span>
                <button
                  onClick={() => logout()}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
