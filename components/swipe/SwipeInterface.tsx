"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CandidateSwipeCard } from "./CandidateSwipeCard";
import { SwipeControls } from "./SwipeControls";
import type { SwipeCandidate } from "./types";

type Props = {
  initialCandidates: SwipeCandidate[];
};

type SwipeState = "idle" | "left" | "right";

const SWIPE_THRESHOLD = 80; // px to count as a swipe decision

export function SwipeInterface({ initialCandidates }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>("idle");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastDecision, setLastDecision] = useState<"INTERESTED" | "PASSED" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const dragStartX = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = candidates[currentIdx];
  const next = candidates[currentIdx + 1];

  const recordDecision = useCallback(
    async (employeeProfileId: string, decision: "INTERESTED" | "PASSED") => {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeProfileId, decision }),
      });
    },
    []
  );

  const advance = useCallback(
    async (decision: "INTERESTED" | "PASSED") => {
      if (!current || isAnimatingOut) return;
      setIsAnimatingOut(true);
      setLastDecision(decision);
      setSwipeState(decision === "INTERESTED" ? "right" : "left");

      await recordDecision(current.id, decision);

      // Show brief feedback flash
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        setDragX(0);
        setSwipeState("idle");
        setIsAnimatingOut(false);
        setCurrentIdx((i) => i + 1);
      }, 400);
    },
    [current, isAnimatingOut, recordDecision]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") advance("PASSED");
      if (e.key === "ArrowRight") advance("INTERESTED");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance]);

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    if (isAnimatingOut) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    setDragX(delta);
    if (delta > 20) setSwipeState("right");
    else if (delta < -20) setSwipeState("left");
    else setSwipeState("idle");
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      advance("INTERESTED");
    } else if (dragX < -SWIPE_THRESHOLD) {
      advance("PASSED");
    } else {
      // Snap back
      setDragX(0);
      setSwipeState("idle");
    }
  };

  if (!current) {
    return <EmptyState />;
  }

  const rotation = isDragging ? (dragX / 20) * 1 : 0;
  const cardStyle = isDragging
    ? {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: "none",
      }
    : isAnimatingOut
    ? {
        transform: `translateX(${swipeState === "right" ? 600 : -600}px) rotate(${swipeState === "right" ? 20 : -20}deg)`,
        transition: "transform 0.35s ease-out",
        opacity: 0,
      }
    : {
        transform: "translateX(0) rotate(0deg)",
        transition: "transform 0.25s ease-out",
      };

  const overlayOpacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6">
      {/* Hint */}
      <p className="text-gray-500 text-sm">
        Swipe or use arrow keys · <span className="text-green-400">→ Interested</span> ·{" "}
        <span className="text-red-400">← Pass</span>
      </p>

      {/* Card stack */}
      <div className="relative w-full" style={{ height: 580 }}>
        {/* Back card (next in queue) */}
        {next && (
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              transform: "scale(0.95) translateY(12px)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <CandidateSwipeCard candidate={next} dim />
          </div>
        )}

        {/* Active card */}
        <div
          ref={cardRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ ...cardStyle, zIndex: 1 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* PASS overlay */}
          <div
            className="absolute inset-0 rounded-3xl z-10 flex items-start justify-end p-6 pointer-events-none"
            style={{
              background: "rgba(239,68,68,0.15)",
              opacity: swipeState === "left" ? overlayOpacity : 0,
              transition: isDragging ? "none" : "opacity 0.2s",
            }}
          >
            <div
              className="border-4 border-red-500 rounded-xl px-4 py-2 rotate-12"
              style={{ opacity: swipeState === "left" ? overlayOpacity : 0 }}
            >
              <span className="text-red-500 font-black text-3xl tracking-widest">PASS</span>
            </div>
          </div>

          {/* LIKE overlay */}
          <div
            className="absolute inset-0 rounded-3xl z-10 flex items-start justify-start p-6 pointer-events-none"
            style={{
              background: "rgba(34,197,94,0.15)",
              opacity: swipeState === "right" ? overlayOpacity : 0,
              transition: isDragging ? "none" : "opacity 0.2s",
            }}
          >
            <div
              className="border-4 border-green-500 rounded-xl px-4 py-2 -rotate-12"
              style={{ opacity: swipeState === "right" ? overlayOpacity : 0 }}
            >
              <span className="text-green-500 font-black text-3xl tracking-widest">YES!</span>
            </div>
          </div>

          <CandidateSwipeCard candidate={current} />
        </div>
      </div>

      {/* Decision feedback flash */}
      {showFeedback && lastDecision && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity ${
            lastDecision === "INTERESTED" ? "bg-green-500/10" : "bg-red-500/10"
          }`}
        >
          <span
            className={`text-7xl font-black tracking-widest border-4 rounded-2xl px-8 py-4 ${
              lastDecision === "INTERESTED"
                ? "text-green-400 border-green-400"
                : "text-red-400 border-red-400"
            }`}
          >
            {lastDecision === "INTERESTED" ? "YES!" : "PASS"}
          </span>
        </div>
      )}

      {/* Button controls */}
      <SwipeControls
        onPass={() => advance("PASSED")}
        onInterested={() => advance("INTERESTED")}
        disabled={isAnimatingOut}
      />

      {/* Progress */}
      <p className="text-gray-600 text-xs">
        {currentIdx + 1} of {candidates.length} candidates
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 max-w-sm mx-auto">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-2xl font-bold text-white mb-3">You&apos;re all caught up!</h2>
      <p className="text-gray-400 mb-8">
        You&apos;ve reviewed all available candidates. Check your interested list or come back
        later as new candidates join.
      </p>
      <div className="flex flex-col gap-3">
        <a
          href="/saved"
          className="rounded-xl bg-green-500 text-white font-semibold px-6 py-3 hover:bg-green-400"
        >
          View interested candidates →
        </a>
        <a
          href="/search"
          className="rounded-xl border border-gray-700 text-gray-300 font-medium px-6 py-3 hover:bg-gray-800"
        >
          Browse all candidates
        </a>
      </div>
    </div>
  );
}
