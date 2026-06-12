"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { store } from "@/lib/local-store";
import { MOCK_CANDIDATES, CAREER_FIELDS, type ExpertiseLevel } from "@/lib/mock-data";
import { formatExpertiseLevel, formatAvailability, availabilityColor, expertiseColor } from "@/lib/utils";

const EXPERTISE_LEVELS: ExpertiseLevel[] = ["INTERN", "ENTRY", "MID", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE"];

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const fieldFilter = searchParams.get("field") ?? "";
  const [selectedLevels, setSelectedLevels] = useState<ExpertiseLevel[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    setSavedIds(store.getSaved().map((s) => s.id));
  }, []);

  const candidates = useMemo(() => {
    return MOCK_CANDIDATES.filter((c) => {
      if (fieldFilter && c.careerField.slug !== fieldFilter) return false;
      if (selectedLevels.length > 0 && !selectedLevels.includes(c.expertiseLevel)) return false;
      if (remoteOnly && !c.openToRemote) return false;
      return true;
    });
  }, [fieldFilter, selectedLevels, remoteOnly]);

  function toggleLevel(level: ExpertiseLevel) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }

  function toggleSave(id: string) {
    if (savedIds.includes(id)) {
      store.unsaveCandidate(id);
      setSavedIds((prev) => prev.filter((s) => s !== id));
    } else {
      store.saveCandidate(id);
      setSavedIds((prev) => [...prev, id]);
    }
  }

  if (!ready || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/swipe" className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">🃏 Swipe</Link>
          <Link href="/saved" className="text-sm text-gray-600 hover:text-gray-900">Saved ({savedIds.length})</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="text-sm text-gray-400 hover:text-gray-600">Log out</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Filters */}
        <aside className="w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-8">
            <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Career Field</p>
              <div className="space-y-1">
                <Link href="/search" className={`block text-sm px-2 py-1 rounded-lg ${!fieldFilter ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                  All fields
                </Link>
                {CAREER_FIELDS.map((f) => (
                  <Link
                    key={f.id}
                    href={`/search?field=${f.slug}`}
                    className={`flex items-center gap-2 text-sm px-2 py-1 rounded-lg ${fieldFilter === f.slug ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    <span>{f.icon}</span>
                    <span className="truncate">{f.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Expertise Level</p>
              <div className="flex flex-wrap gap-1.5">
                {EXPERTISE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedLevels.includes(level)
                        ? "border-blue-400 bg-blue-50 text-blue-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {formatExpertiseLevel(level)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Work Style</p>
              <button
                onClick={() => setRemoteOnly((v) => !v)}
                className={`text-sm flex items-center gap-2 ${remoteOnly ? "text-blue-600 font-medium" : "text-gray-700"}`}
              >
                <span className={`h-4 w-4 rounded border flex items-center justify-center text-xs ${remoteOnly ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"}`}>
                  {remoteOnly && "✓"}
                </span>
                Remote only
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{candidates.length}</span> candidates
              {fieldFilter && ` in ${CAREER_FIELDS.find((f) => f.slug === fieldFilter)?.name ?? fieldFilter}`}
            </p>
            <Link href="/swipe" className="text-sm text-green-600 font-medium hover:underline">
              🃏 Try swipe mode
            </Link>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-600">No candidates match these filters</p>
              <Link href="/search" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                      {candidate.displayName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{candidate.displayName}</p>
                      <p className="text-sm text-gray-500 truncate">{candidate.headline}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(candidate.id)}
                      className={`flex-shrink-0 text-lg transition-transform hover:scale-110 ${savedIds.includes(candidate.id) ? "opacity-100" : "opacity-30 hover:opacity-70"}`}
                      title={savedIds.includes(candidate.id) ? "Remove from saved" : "Save candidate"}
                    >
                      {savedIds.includes(candidate.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expertiseColor(candidate.expertiseLevel)}`}>
                      {formatExpertiseLevel(candidate.expertiseLevel)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${availabilityColor(candidate.availabilityStatus)}`}>
                      {formatAvailability(candidate.availabilityStatus)}
                    </span>
                    {candidate.openToRemote && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">Remote</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">{candidate.careerField.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((ps) => (
                        <span key={ps.skill.name} className="text-xs bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 text-gray-600">
                          {ps.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {candidate.location && (
                    <p className="mt-2 text-xs text-gray-400">📍 {candidate.location}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
