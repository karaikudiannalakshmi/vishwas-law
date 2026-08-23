import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Vishwa's Law",
  description: "Case tracking and grounded drafting assistant for lawyers",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <NavBar />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
