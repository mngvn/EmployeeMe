"use client";

type Props = {
  onPass: () => void;
  onInterested: () => void;
  disabled?: boolean;
};

export function SwipeControls({ onPass, onInterested, disabled }: Props) {
  return (
    <div className="flex items-center gap-8">
      <button
        onClick={onPass}
        disabled={disabled}
        aria-label="Pass"
        className="h-16 w-16 rounded-full bg-gray-800 border-2 border-red-500/50 text-red-400 text-2xl
          hover:bg-red-950 hover:border-red-400 active:scale-95 transition-all disabled:opacity-40 shadow-lg"
      >
        ✕
      </button>

      <button
        onClick={onInterested}
        disabled={disabled}
        aria-label="Interested — add to interview queue"
        className="h-20 w-20 rounded-full bg-green-500 border-2 border-green-400 text-white text-3xl
          hover:bg-green-400 active:scale-95 transition-all disabled:opacity-40 shadow-[0_0_24px_rgba(34,197,94,0.4)]"
      >
        ✓
      </button>

      <button
        onClick={onPass}
        disabled={disabled}
        aria-label="Skip this candidate"
        className="h-16 w-16 rounded-full bg-gray-800 border-2 border-gray-600 text-gray-400 text-xl
          hover:bg-gray-700 hover:border-gray-500 active:scale-95 transition-all disabled:opacity-40 shadow-lg"
        title="Skip (same as pass)"
      >
        ⟫
      </button>
    </div>
  );
}
