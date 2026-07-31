/**
 * @deprecated SCHEDULED FOR REMOVAL — use `@/utils/security/storage` instead.
 *
 * This module used to brand `btoa(encodeURIComponent(v))` as "encryption"
 * and carried an AES-GCM path with a hardcoded passphrase baked into the
 * bundle. Client-side "encryption" with a key shipped to the client protects
 * nothing, so that code has been deleted. This file only remains as a
 * compile-compatibility shim for imports that have not been migrated yet.
 */
import { appStorage } from "./storage";

/**
 * @deprecated Use `appStorage` from `@/utils/security/storage`.
 * The `encrypt`/`encrypted` flags are ignored: values are stored plain.
 * Reads still transparently accept legacy-base64 values (handled by
 * `storage.ts`) and migrate them to plain text.
 */
export const secureStorage = {
  setItem: (key: string, value: string, _encrypt: boolean = false): void => {
    appStorage.set(key, value);
  },
  getItem: (key: string, _encrypted: boolean = false): string | null => {
    return appStorage.get(key);
  },
  removeItem: (key: string): void => {
    appStorage.remove(key);
  },
};

export { appStorage };
