"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { store } from "@/lib/local-store";
import { MOCK_CANDIDATES, CAREER_FIELDS } from "@/lib/mock-data";
import { formatExpertiseLevel, formatAvailability, availabilityColor } from "@/lib/utils";

export default function DashboardPage() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return user.role === "employer" ? (
    <EmployerDashboard name={user.name} company={user.companyName} onLogout={() => { logout(); router.push("/"); }} />
  ) : (
    <EmployeeDashboard name={user.name} onLogout={() => { logout(); router.push("/"); }} />
  );
}

function EmployerDashboard({ name, company, onLogout }: { name: string; company?: string; onLogout: () => void }) {
  const saved = store.getSaved();
  const swipes = store.getSwipes();
  const interested = swipes.filter((s) => s.decision === "INTERESTED");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/swipe" className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">🃏 Swipe</Link>
          <Link href="/search" className="text-sm font-medium text-blue-600 hover:text-blue-700">Search candidates</Link>
          <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved</Link>
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">Log out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company ?? name} Dashboard</h1>
          <p className="text-gray-500 mt-1">Find the right people for your team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Candidates available</p>
            <p className="text-3xl font-bold text-gray-900">{MOCK_CANDIDATES.length}</p>
            <p className="text-xs text-gray-400 mt-1">across all fields</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Saved candidates</p>
            <p className="text-3xl font-bold text-gray-900">{saved.length}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Swiped interested</p>
            <p className="text-3xl font-bold text-green-600">{interested.length}</p>
          </div>
        </div>

        {/* Swipe CTA */}
        <div className="rounded-2xl p-6 text-white flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1c1c2e 0%, #2d1b69 100%)" }}>
          <div>
            <h2 className="font-semibold text-lg">🃏 Swipe through candidates</h2>
            <p className="text-gray-300 text-sm mt-1">Tinder-style review — swipe right to add to your interview queue.</p>
          </div>
          <Link href="/swipe" className="rounded-lg bg-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-400 whitespace-nowrap">
            Start swiping →
          </Link>
        </div>

        {/* Search CTA */}
        <div className="rounded-2xl bg-blue-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Browse all candidates</h2>
            <p className="text-blue-100 text-sm mt-1">Filter by career field, expertise level, skills, and more.</p>
          </div>
          <Link href="/search" className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 whitespace-nowrap">
            Open search →
          </Link>
        </div>

        {/* Career field grid */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Browse by career field</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CAREER_FIELDS.map((field) => (
              <Link
                key={field.id}
                href={`/search?field=${field.slug}`}
                className="rounded-xl border border-gray-100 p-3 text-center hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <div className="text-2xl mb-1">{field.icon}</div>
                <p className="text-xs font-medium text-gray-700 leading-tight">{field.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-gray-600">Log out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {name}</h1>
          <p className="text-gray-500 mt-1">Your profile is visible to employers searching for talent.</p>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="font-semibold text-blue-900 mb-2">Profile features coming soon</h2>
          <p className="text-blue-700 text-sm">
            This is the MVP. Profile editing, view tracking, and messaging are in the next phase.
            For now, explore the platform as an employer to see how your profile would appear.
          </p>
          <Link href="/search" className="mt-4 inline-block text-sm text-blue-600 font-medium hover:underline">
            See how employers view candidates →
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sample profiles in the system</h2>
          <div className="space-y-3">
            {MOCK_CANDIDATES.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.displayName}</p>
                  <p className="text-xs text-gray-500">{c.careerField.name} · {formatExpertiseLevel(c.expertiseLevel)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${availabilityColor(c.availabilityStatus)}`}>
                  {formatAvailability(c.availabilityStatus)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
