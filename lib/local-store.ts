// SSR-safe localStorage helpers

export type MockUser = {
  name: string;
  role: "employer" | "employee";
  companyName?: string;
};

export type SwipeDecision = { id: string; decision: "INTERESTED" | "PASSED" };
export type SavedCandidate = { id: string; savedAt: string };

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUser: (): MockUser | null => get<MockUser | null>("em_user", null),
  setUser: (user: MockUser) => set("em_user", user),
  clearUser: () => typeof window !== "undefined" && localStorage.removeItem("em_user"),

  getSwipes: (): SwipeDecision[] => get<SwipeDecision[]>("em_swipes", []),
  addSwipe: (id: string, decision: "INTERESTED" | "PASSED") => {
    const existing = store.getSwipes().filter((s) => s.id !== id);
    set("em_swipes", [...existing, { id, decision }]);
    if (decision === "INTERESTED") {
      store.saveCandidate(id);
    }
  },
  getSwipedIds: (): string[] => store.getSwipes().map((s) => s.id),

  getSaved: (): SavedCandidate[] => get<SavedCandidate[]>("em_saved", []),
  saveCandidate: (id: string) => {
    const existing = store.getSaved();
    if (!existing.find((s) => s.id === id)) {
      set("em_saved", [...existing, { id, savedAt: new Date().toISOString() }]);
    }
  },
  unsaveCandidate: (id: string) => {
    set("em_saved", store.getSaved().filter((s) => s.id !== id));
  },
  isSaved: (id: string): boolean => store.getSaved().some((s) => s.id === id),
};
