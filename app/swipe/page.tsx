"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { store } from "@/lib/local-store";
import { MOCK_CANDIDATES } from "@/lib/mock-data";
import { SwipeInterface } from "@/components/swipe/SwipeInterface";

export default function SwipePage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [queue, setQueue] = useState<typeof MOCK_CANDIDATES>([]);
  const [interestedCount, setInterestedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (ready && !user) { router.replace("/login"); return; }
    if (ready && user?.role !== "employer") { router.replace("/dashboard"); return; }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    const swipedIds = new Set(store.getSwipedIds());
    const unswiped = MOCK_CANDIDATES.filter((c) => !swipedIds.has(c.id));
    setQueue(unswiped);
    setInterestedCount(store.getSwipes().filter((s) => s.decision === "INTERESTED").length);
    setMounted(true);
  }, [ready, user]);

  if (!ready || !user || !mounted) return null;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/dashboard" className="text-lg font-bold text-white">EmployeeMe</Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-400">
            <span className="text-green-400 font-semibold">{interestedCount}</span> interested
          </span>
          <Link href="/saved" className="text-sm text-gray-400 hover:text-white">View shortlist →</Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <SwipeInterface
          initialCandidates={queue}
          onDecision={(id, decision) => {
            store.addSwipe(id, decision);
            if (decision === "INTERESTED") {
              setInterestedCount((n) => n + 1);
            }
          }}
        />
      </div>
    </div>
  );
}
