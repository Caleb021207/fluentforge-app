import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Auth + per-user daily rate limiting for edge functions that call paid APIs.
 *
 * NOTE: the platform has no standard rate-limiting primitive, so this is an
 * ad-hoc implementation backed by the service-role-only `usage_counters`
 * table and the `consume_rate_limit` SECURITY DEFINER function.
 */

export interface Gate {
  userId?: string;
  error?: Response;
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

/** Verify the caller's JWT and consume one unit of their daily quota. */
export async function guardPaidRequest(
  req: Request,
  corsHeaders: Record<string, string>,
  bucket: string,
  dailyLimit: number,
): Promise<Gate> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        error: new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }),
      };
    }

    const supabase = serviceClient();
    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return {
        error: new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }),
      };
    }

    const userId = data.user.id;
    const { data: allowed, error: rlError } = await supabase.rpc("consume_rate_limit", {
      p_user_id: userId,
      p_bucket: bucket,
      p_daily_limit: dailyLimit,
    });

    if (rlError) {
      console.error("rate limit check failed:", rlError);
      // Fail closed on paid endpoints.
      return {
        error: new Response(JSON.stringify({ error: "Rate limit unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }),
      };
    }

    if (allowed === false) {
      return {
        userId,
        error: new Response(
          JSON.stringify({ error: "Daily limit reached for this feature. Try again tomorrow." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        ),
      };
    }

    return { userId };
  } catch (e) {
    console.error("guardPaidRequest error:", e);
    return {
      error: new Response(JSON.stringify({ error: "Authorization failed" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
}

/** Verify the caller's JWT only (no quota consumption). */
export async function requireUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Gate> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
  const supabase = serviceClient();
  const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !data?.user) {
    return {
      error: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }
  return { userId: data.user.id };
}
