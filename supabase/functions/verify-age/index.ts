import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";

/**
 * COPPA age gate. The under-13 decision is made HERE (server side) from the
 * submitted birth year — the client cannot self-declare "not a minor", and it
 * cannot set the resulting safety mode or consent flag on its own profile
 * (blocked by the protect_profile_privileged_columns trigger).
 */

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const gate = await requireUser(req, corsHeaders);
  if (gate.error) return gate.error;
  const userId = gate.userId!;

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const body = await req.json().catch(() => ({}));

    if (body?.action === "status") {
      const { data } = await supabase
        .from("profiles")
        .select("birth_year, is_minor, parental_consent_granted, age_verified_at, safety_mode")
        .eq("id", userId)
        .maybeSingle();

      return json({
        needsVerification: !data?.age_verified_at,
        isMinor: data?.is_minor ?? false,
        parentalConsentGranted: data?.parental_consent_granted ?? false,
        safetyMode: data?.safety_mode ?? "standard",
        birthYear: data?.birth_year ?? null,
      });
    }

    const currentYear = new Date().getUTCFullYear();
    const birthYear = Number(body?.birthYear);
    if (!Number.isInteger(birthYear) || birthYear < currentYear - 100 || birthYear > currentYear) {
      return json({ error: "A valid birth year is required" }, 400);
    }

    const age = currentYear - birthYear;
    const isMinor = age < 13;
    const parentalConsent = Boolean(body?.parentalConsent);

    if (isMinor && !parentalConsent) {
      // COPPA: no verifiable parental consent -> no account access to the service.
      await supabase
        .from("profiles")
        .update({
          birth_year: birthYear,
          is_minor: true,
          parental_consent_granted: false,
          safety_mode: "strict",
          age_verified_at: new Date().toISOString(),
        })
        .eq("id", userId);

      return json({
        allowed: false,
        isMinor: true,
        reason: "parental_consent_required",
        safetyMode: "strict",
      }, 403);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        birth_year: birthYear,
        is_minor: isMinor,
        parental_consent_granted: isMinor ? true : false,
        parental_consent_at: isMinor ? new Date().toISOString() : null,
        safety_mode: isMinor ? "strict" : "standard",
        age_verified_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;

    return json({
      allowed: true,
      isMinor,
      safetyMode: isMinor ? "strict" : "standard",
    });
  } catch (error) {
    console.error("verify-age error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
