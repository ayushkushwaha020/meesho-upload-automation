import { useSyncExternalStore } from "react";
import type { Listing, Settings } from "./types";
import { seedListings } from "./seed";

const KEY = "meeshosnap.v1";

export const DEFAULT_SETTINGS: Settings = {
  manufacturerDetails: "",
  packerDetails: "",
  importerDetails: "",
  defaultHsn: "7117",
  defaultGst: "3",
  skuPrefix: "MS",
  marginPct: 60,
  mrpMarkupPct: 80,
  roundTo: 10,
  defaultQuantity: "",
  imageTarget: 8,
};

interface State {
  listings: Listing[];
  settings: Settings;
  seq: number;
}

const EMPTY: State = { listings: [], settings: DEFAULT_SETTINGS, seq: 1 };
let state: State = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      state = { ...EMPTY, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings } };
      return;
    }
  } catch {
    /* ignore corrupt storage */
  }
  state = { ...EMPTY, listings: seedListings(), seq: 3 };
  persist();
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded (large photos) — keep in memory
  }
}

function set(next: State) {
  state = next;
  persist();
  subs.forEach((f) => f());
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => {
      load();
      return sel(state);
    },
    () => sel(EMPTY),
  );
}

export const store = {
  get: () => {
    load();
    return state;
  },
  nextSeq() {
    const n = store.get().seq;
    set({ ...state, seq: n + 1 });
    return n;
  },
  upsert(l: Listing) {
    const s = store.get();
    const exists = s.listings.some((x) => x.id === l.id);
    const updated = { ...l, updatedAt: new Date().toISOString() };
    set({ ...s, listings: exists ? s.listings.map((x) => (x.id === l.id ? updated : x)) : [updated, ...s.listings] });
  },
  update(id: string, fn: (l: Listing) => Listing) {
    const l = store.get().listings.find((x) => x.id === id);
    if (l) store.upsert(fn(l));
  },
  remove(id: string) {
    set({ ...store.get(), listings: state.listings.filter((x) => x.id !== id) });
  },
  saveSettings(settings: Settings) {
    set({ ...store.get(), settings });
  },
  resetDemo() {
    set({ ...EMPTY, listings: seedListings(), seq: 3 });
  },
};

export const uid = () => Math.random().toString(36).slice(2, 10);