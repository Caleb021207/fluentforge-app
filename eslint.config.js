import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Not linted by this browser/React config:
  //  - dist: build output
  //  - supabase/functions: a separate Deno runtime with its own globals
  //  - the offline translation-management scripts, which are Node tooling
  //    (require(), fs) and are not part of the shipped app bundle
  {
    ignores: [
      "dist",
      "supabase/functions/**",
      "src/utils/translationExtractor.ts",
      "src/utils/translationValidator.ts",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Pervasive in the original generated code. Surfaced as warnings so it
      // stays visible as tech debt without blocking CI; tighten incrementally.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  }
);
