import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Test runner for the web app and pure shared logic.
 *
 * Deno edge functions are NOT run under vitest (different runtime, URL
 * imports). Pure server logic is characterized either through extracted
 * import-clean modules or via `deno test` once the Deno toolchain is
 * available (LEDGER 0.2/0.3 notes). Do not import files from
 * supabase/functions/ here.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary"],
    },
  },
});
