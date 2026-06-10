"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

type AccountType = "employee" | "employer" | null;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"type" | "form">(
    searchParams.get("type") ? "form" : "type"
  );
  const [accountType, setAccountType] = useState<AccountType>(
    (searchParams.get("type") as AccountType) ?? null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: accountType?.toUpperCase(),
          name,
          companyName: accountType === "employer" ? companyName : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }

      await signIn("credentials", { email, password, redirect: false });
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (step === "type") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">EmployeeMe</Link>
            <p className="text-gray-500 mt-2">How will you be using EmployeeMe?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setAccountType("employer"); setStep("form"); }}
              className="rounded-2xl border-2 border-gray-100 bg-white p-8 text-left hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">I&apos;m hiring</h3>
              <p className="text-sm text-gray-500">Browse candidate profiles and find the right talent for your team.</p>
            </button>
            <button
              onClick={() => { setAccountType("employee"); setStep("form"); }}
              className="rounded-2xl border-2 border-gray-100 bg-white p-8 text-left hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <div className="text-4xl mb-4">👤</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">I&apos;m looking for work</h3>
              <p className="text-sm text-gray-500">Build a profile and get discovered by employers who need your skills.</p>
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gray-900">EmployeeMe</Link>
          <p className="text-gray-500 mt-2">
            Create your {accountType === "employer" ? "employer" : "candidate"} account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <button
            onClick={() => setStep("type")}
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
          >
            ← Change account type
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {accountType === "employer" ? "Your name" : "Full name"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Jane Smith"
              />
            </div>

            {accountType === "employer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Acme Corp"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                accountType === "employer"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
