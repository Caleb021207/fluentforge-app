import { describe, it, expect } from "vitest";
import { createStorage, createMemoryBackend } from "./storage";

/** Encode exactly like the removed legacy "encryption" wrapper did. */
const legacyEncode = (value: string) => btoa(encodeURIComponent(value));

describe("storage wrapper", () => {
  it("writes plain values (no encoding)", () => {
    const backend = createMemoryBackend();
    const storage = createStorage("", backend);

    storage.set("targetLanguage", "spanish");

    expect(backend.getItem("targetLanguage")).toBe("spanish");
    expect(storage.get("targetLanguage")).toBe("spanish");
  });

  it("preserves bare legacy key names (no namespace on app storage)", () => {
    const backend = createMemoryBackend();
    backend.setItem("nativeLanguage", "english");
    const storage = createStorage("", backend);

    expect(storage.get("nativeLanguage")).toBe("english");
  });

  it("reads legacy-base64 values and migrates them to plain", () => {
    const backend = createMemoryBackend();
    backend.setItem("placementLevel", legacyEncode("B1"));
    const storage = createStorage("", backend);

    expect(storage.get("placementLevel")).toBe("B1");
    // Migrated: stored plain after the first read.
    expect(backend.getItem("placementLevel")).toBe("B1");
  });

  it("decodes legacy values containing non-ASCII characters", () => {
    const backend = createMemoryBackend();
    backend.setItem("greeting", legacyEncode("¡hola señor!"));
    const storage = createStorage("", backend);

    expect(storage.get("greeting")).toBe("¡hola señor!");
  });

  it("does not mangle plain values that happen to look base64-ish", () => {
    const backend = createMemoryBackend();
    const storage = createStorage("", backend);
    // Short plain values like CEFR levels must survive the legacy-decode probe.
    for (const plain of ["B1", "es", "english", "abcd", "test1234"]) {
      backend.setItem("k", plain);
      expect(storage.get("k")).toBe(plain);
    }
  });

  it("returns null for missing keys", () => {
    const storage = createStorage("", createMemoryBackend());
    expect(storage.get("missing")).toBeNull();
  });

  it("removes values and the legacy _expires companion key", () => {
    const backend = createMemoryBackend();
    backend.setItem("targetLanguage", "spanish");
    backend.setItem("targetLanguage_expires", "1234567890");
    const storage = createStorage("", backend);

    storage.remove("targetLanguage");

    expect(backend.getItem("targetLanguage")).toBeNull();
    expect(backend.getItem("targetLanguage_expires")).toBeNull();
  });

  it("drops the legacy _expires companion key on write", () => {
    const backend = createMemoryBackend();
    backend.setItem("nativeLanguage_expires", "1234567890");
    const storage = createStorage("", backend);

    storage.set("nativeLanguage", "french");

    expect(backend.getItem("nativeLanguage_expires")).toBeNull();
  });

  it("round-trips JSON values", () => {
    const storage = createStorage("", createMemoryBackend());
    storage.setJSON("prefs", { a: 1, b: ["x", "y"] });
    expect(storage.getJSON("prefs", null)).toEqual({ a: 1, b: ["x", "y"] });
  });

  it("returns the fallback for missing or invalid JSON", () => {
    const backend = createMemoryBackend();
    const storage = createStorage("", backend);
    expect(storage.getJSON("missing", "fallback")).toBe("fallback");
    backend.setItem("bad", "{not json");
    expect(storage.getJSON("bad", 42)).toBe(42);
  });

  it("prefixes keys when a namespace is provided", () => {
    const backend = createMemoryBackend();
    const storage = createStorage("pv", backend);
    storage.set("theme", "dark");
    expect(backend.getItem("pv:theme")).toBe("dark");
    expect(storage.get("theme")).toBe("dark");
  });
});
