import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in or create an account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <section className="min-h-screen bg-slate-50">{children}</section>;
}
