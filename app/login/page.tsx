"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/dashboard");
      } else {
        await signup(email, password, name);
        // Don't route straight into the app - RequireAuth will also block
        // an unverified account, but showing this here is more welcoming
        // than bouncing them into dashboard first.
        setJustSignedUp(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (justSignedUp) {
    return (
      <div className="max-w-sm mx-auto mt-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-slate-600 mb-6">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click
          it, then continue to your account.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-700"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-1">
        {mode === "login" ? "Sign in" : "Create an account"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {mode === "login"
          ? "Access is limited to people the firm has invited."
          : "You'll need to confirm your email before you can see any case data."}
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="How your name should appear in the app"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-slate-900 px-4 py-2 text-white font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-4 text-sm text-slate-500 hover:text-slate-800 underline"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
