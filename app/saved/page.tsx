"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { store } from "@/lib/local-store";
import { MOCK_CANDIDATES } from "@/lib/mock-data";
import { formatExpertiseLevel, expertiseColor, availabilityColor, formatAvailability } from "@/lib/utils";

export default function SavedPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (ready && !user) { router.replace("/login"); return; }
    setSavedIds(store.getSaved().map((s) => s.id));
    setMounted(true);
  }, [ready, user, router]);

  const savedCandidates = MOCK_CANDIDATES.filter((c) => savedIds.includes(c.id));

  function handleRemove(id: string) {
    store.unsaveCandidate(id);
    setSavedIds((prev) => prev.filter((s) => s !== id));
  }

  if (!ready || !mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">EmployeeMe</Link>
        <div className="flex items-center gap-4">
          <Link href="/swipe" className="text-sm font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">🃏 Swipe</Link>
          <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">Search</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Saved candidates</h1>
          <p className="text-gray-500 mt-1">{savedCandidates.length} candidate{savedCandidates.length !== 1 ? "s" : ""} in your shortlist</p>
        </div>

        {savedCandidates.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium text-gray-600">No saved candidates yet</p>
            <p className="text-sm text-gray-400 mt-2">Swipe right or click the heart icon to save candidates.</p>
            <div className="flex gap-3 justify-center mt-6">
              <Link href="/swipe" className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">🃏 Start swiping</Link>
              <Link href="/search" className="rounded-lg border border-gray-200 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50">Browse candidates</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                    {candidate.displayName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{candidate.displayName}</p>
                    <p className="text-sm text-gray-500 truncate">{candidate.headline}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(candidate.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors text-sm"
                    title="Remove from saved"
                  >
                    ✕
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

                {candidate.workExperiences.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{candidate.workExperiences[0].title}</span> at {candidate.workExperiences[0].company}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
