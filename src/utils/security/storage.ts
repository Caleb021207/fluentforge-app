/**
 * Plain client-side storage wrapper for non-sensitive UI preferences
 * (language choices, placement level, etc.).
 *
 * This module makes NO security or encryption claims. Values are written to
 * localStorage in plain text, on purpose: anything the client can decrypt,
 * an attacker with access to the same client can decrypt too, so "encrypted
 * localStorage" is theater. Do NOT store secrets, tokens, or student PII
 * here — server state (Supabase, RLS-protected) is the source of truth for
 * anything sensitive.
 *
 * History: this replaces `dataEncryption.ts`, which branded
 * `btoa(encodeURIComponent(v))` as encryption and carried an AES-GCM path
 * with a hardcoded passphrase. Reads transparently accept values written by
 * that legacy encoder and migrate them to plain text.
 */

type StringStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** In-memory fallback for environments without localStorage (tests, SSR). */
export const createMemoryBackend = (): StringStore => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
};

const defaultBackend = (): StringStore => {
  try {
    if (typeof localStorage !== "undefined" && localStorage !== null) {
      return localStorage;
    }
  } catch {
    // Accessing localStorage can throw (e.g. blocked third-party context).
  }
  return createMemoryBackend();
};

/**
 * Decode a value written by the removed legacy encoder
 * (`btoa(encodeURIComponent(value))`). The strict round-trip check keeps
 * ordinary plain values (which may happen to be base64-decodable) intact.
 */
const decodeLegacyValue = (raw: string): string => {
  try {
    const decoded = decodeURIComponent(atob(raw));
    if (btoa(encodeURIComponent(decoded)) === raw) {
      return decoded;
    }
  } catch {
    // Not legacy-encoded; fall through and treat as plain.
  }
  return raw;
};

export interface AppStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  getJSON<T>(key: string, fallback: T): T;
  setJSON(key: string, value: unknown): void;
}

/**
 * Create a storage wrapper. `namespace` (optional) prefixes every key with
 * `"<namespace>:"`; the app-wide instance below uses NO namespace so that
 * existing users' prefs stored under bare legacy keys keep working.
 */
export const createStorage = (
  namespace = "",
  backend: StringStore = defaultBackend()
): AppStorage => {
  const fullKey = (key: string) => (namespace ? `${namespace}:${key}` : key);
  // The legacy wrapper wrote a `<key>_expires` companion entry; clean it up.
  const dropExpiryKey = (key: string) => {
    try {
      backend.removeItem(`${fullKey(key)}_expires`);
    } catch {
      // ignore
    }
  };

  return {
    get(key: string): string | null {
      try {
        const raw = backend.getItem(fullKey(key));
        if (raw === null) return null;
        const value = decodeLegacyValue(raw);
        if (value !== raw) {
          // Migrate: always store plain going forward.
          backend.setItem(fullKey(key), value);
          dropExpiryKey(key);
        }
        return value;
      } catch {
        return null;
      }
    },

    set(key: string, value: string): void {
      try {
        backend.setItem(fullKey(key), value);
        dropExpiryKey(key);
      } catch {
        // Quota exceeded / storage unavailable: prefs are best-effort.
      }
    },

    remove(key: string): void {
      try {
        backend.removeItem(fullKey(key));
        dropExpiryKey(key);
      } catch {
        // ignore
      }
    },

    getJSON<T>(key: string, fallback: T): T {
      const raw = this.get(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },

    setJSON(key: string, value: unknown): void {
      this.set(key, JSON.stringify(value));
    },
  };
};

/**
 * App-wide preference storage. Deliberately un-namespaced: existing users
 * already have values under bare keys ("nativeLanguage", "targetLanguage",
 * "placementLevel") and renaming keys would silently drop their prefs.
 */
export const appStorage: AppStorage = createStorage();
