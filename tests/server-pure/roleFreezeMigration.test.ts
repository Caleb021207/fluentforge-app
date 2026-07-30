import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * FILE-CONTENT CONTRACT TEST (static characterization).
 *
 * SQL cannot execute under vitest, so this test parses the migration text of
 * 20260731000000_restore_role_freeze_and_staff_provisioning.sql and asserts
 * the security-load-bearing clauses are present verbatim (plan 15 §1.2 role
 * re-freeze, Phase-0 backlog R1; 19 #6). It guards against the exact
 * regression that produced the G1 exploit: 20260730010000 "paraphrased" the
 * strict trigger into one that let any user flip role to 'teacher'.
 *
 * What this test can and cannot claim: it proves the migration FILE carries
 * the strict semantics; it cannot prove runtime behavior. Runtime validation
 * happens on staging before the migration is applied (LEDGER 0.4 —
 * prepared, not applied).
 */

const migrationPath = fileURLToPath(
  new URL(
    "../../supabase/migrations/20260731000000_restore_role_freeze_and_staff_provisioning.sql",
    import.meta.url
  )
);
const sql = readFileSync(migrationPath, "utf8");

describe("role-freeze migration file contract", () => {
  it("is marked prepared-not-applied", () => {
    expect(sql).toContain(
      "PREPARED, NOT APPLIED — staging validation required (LEDGER 0.4)."
    );
  });

  describe("strict protect_profile_privileged_columns trigger (20260729061713 semantics)", () => {
    it("redefines the trigger function with definer + empty search_path", () => {
      expect(sql).toMatch(
        /CREATE OR REPLACE FUNCTION public\.protect_profile_privileged_columns\(\)\s*\nRETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''/
      );
    });

    it("freezes role unconditionally on UPDATE (NEW.role := OLD.role directly followed by the account_tier freeze)", () => {
      // In the strict version the UPDATE branch begins with these two
      // assignments back-to-back. In the reverted permissive version
      // (20260730010000) `NEW.role := OLD.role;` only appears inside an
      // ELSE with an `END IF;` between it and the account_tier line, so
      // this regex discriminates strict from permissive.
      expect(sql).toMatch(
        /NEW\.role := OLD\.role;\s*\n\s*NEW\.account_tier := OLD\.account_tier;/
      );
    });

    it("contains no student<->teacher role-transition carve-out", () => {
      expect(sql).not.toMatch(/OLD\.role IN \('student',\s*'teacher'\)/);
      expect(sql).not.toMatch(/permitted transition/);
    });

    it("forces INSERTs to role student only", () => {
      expect(sql).toContain(
        "IF NEW.role <> 'student' THEN NEW.role := 'student'; END IF;"
      );
    });

    it("re-attaches the BEFORE INSERT OR UPDATE trigger on profiles", () => {
      expect(sql).toMatch(
        /CREATE TRIGGER protect_profile_privileged_columns\s*\nBEFORE INSERT OR UPDATE ON public\.profiles/
      );
    });
  });

  describe("staff_access_codes", () => {
    it("enables RLS", () => {
      expect(sql).toContain(
        "ALTER TABLE public.staff_access_codes ENABLE ROW LEVEL SECURITY;"
      );
    });

    it("has an admin-only ALL policy and no other policy on the table", () => {
      expect(sql).toMatch(
        /CREATE POLICY "Admins manage staff access codes" ON public\.staff_access_codes\s*\nFOR ALL TO authenticated\s*\nUSING \(public\.has_role\(auth\.uid\(\), 'admin'\)\)\s*\nWITH CHECK \(public\.has_role\(auth\.uid\(\), 'admin'\)\);/
      );
      const policyCount = (
        sql.match(/CREATE POLICY .* ON public\.staff_access_codes/g) ?? []
      ).length;
      expect(policyCount).toBe(1);
    });

    it("stores only a code hash (no plaintext code column)", () => {
      expect(sql).toMatch(/code_hash text PRIMARY KEY/);
      expect(sql).not.toMatch(/^\s*code text/m);
    });

    it("revokes anon table access", () => {
      expect(sql).toContain(
        "REVOKE ALL ON public.staff_access_codes FROM anon;"
      );
    });
  });

  describe("provision_teacher RPC", () => {
    it("is SECURITY DEFINER with empty search_path", () => {
      const header = sql.slice(
        sql.indexOf("CREATE OR REPLACE FUNCTION public.provision_teacher")
      );
      const signature = header.slice(0, header.indexOf("AS $$"));
      expect(signature).toContain("SECURITY DEFINER");
      expect(signature).toContain("SET search_path = ''");
    });

    it("enables pgcrypto and compares sha256 digests", () => {
      expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS pgcrypto");
      expect(sql).toMatch(/digest\(v_normalized, 'sha256'\)/);
    });

    it("validates revoked/expiry/max-uses in the atomic consume", () => {
      expect(sql).toContain("AND revoked = false");
      expect(sql).toMatch(/expires_at IS NULL OR expires_at > now\(\)/);
      expect(sql).toMatch(/max_uses IS NULL OR current_uses < max_uses/);
      expect(sql).toContain("SET current_uses = current_uses + 1");
    });

    it("guards the audit insert with to_regclass", () => {
      expect(sql).toMatch(
        /IF to_regclass\('public\.educational_data_access_audit'\) IS NOT NULL THEN/
      );
    });

    it("revokes anon and grants only authenticated execute", () => {
      expect(sql).toContain(
        "REVOKE ALL ON FUNCTION public.provision_teacher(text) FROM public, anon;"
      );
      expect(sql).toContain(
        "GRANT EXECUTE ON FUNCTION public.provision_teacher(text) TO authenticated;"
      );
    });
  });
});
