"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile,
  reload,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    }
    // Every new account must confirm the email address before it can see
    // any case data - see RequireAuth, which blocks unverified accounts.
    await sendEmailVerification(cred.user);
    // Force local state to reflect the just-created user immediately
    // (onAuthStateChanged will also fire, but this avoids a flash of
    // "no user" while we wait for it).
    setUser({ ...cred.user });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setUser(auth.currentUser ? { ...auth.currentUser } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, resendVerificationEmail, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
