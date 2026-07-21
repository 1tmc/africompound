import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue to your AfriCompound workspace.
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="flex items-center justify-center rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
