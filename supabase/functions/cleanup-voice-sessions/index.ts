import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";

/**
 * Closes voice sessions that were never ended by the client (tab closed, crash…).
 *
 * Previously this pointed at a `premium_voice_chat_sessions` table that does not
 * exist, so it silently did nothing. It now operates on `usage_tracking`, which is
 * where voice sessions are actually recorded.
 *
 * 2026-07-30 (overhaul WS 1.1; plan 15 §R4): added `requireUser` — this function
 * had NO in-body auth and no config.toml entry, so any holder of the public anon
 * key could trigger a service-role sweep. It is invoked from the client
 * (`src/utils/voiceChatUtils.ts`) via `functions.invoke`, which attaches the
 * user JWT, so requiring a verified user is non-breaking. The sweep itself is
 * idempotent maintenance (caps billing at MAX_BILLABLE_MINUTES, only touches
 * rows already abandoned >15 min), so authenticated-user access is acceptable
 * until it moves to a scheduled service-role job (Phase 2).
 */

const VOICE_SESSION_TYPES = ['voice_practice', 'premium_voice_practice'];
const ABANDON_AFTER_MINUTES = 15;
const MAX_BILLABLE_MINUTES = 10;

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const gate = await requireUser(req, corsHeaders);
  if (gate.error) return gate.error;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const cutoff = new Date(Date.now() - ABANDON_AFTER_MINUTES * 60 * 1000).toISOString();

    const { data: abandoned, error: queryError } = await supabase
      .from('usage_tracking')
      .select('id, student_id, created_at, minutes_used')
      .in('session_type', VOICE_SESSION_TYPES)
      .is('ended_at', null)
      .lt('created_at', cutoff);

    if (queryError) throw queryError;

    if (!abandoned?.length) {
      return new Response(
        JSON.stringify({ success: true, closed: 0, message: 'No abandoned sessions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = Date.now();
    const touchedUsers = new Set<string>();
    const results: Array<{ sessionId: string; success: boolean; error: string | null }> = [];

    for (const session of abandoned) {
      const started = new Date(session.created_at).getTime();
      const elapsedMinutes = Math.max(0, Math.round((now - started) / 60000));
      const billed = Math.min(elapsedMinutes, MAX_BILLABLE_MINUTES);
      const endedAt = new Date(started + billed * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('usage_tracking')
        .update({ ended_at: endedAt, minutes_used: session.minutes_used ?? billed })
        .eq('id', session.id);

      results.push({
        sessionId: session.id,
        success: !error,
        error: error ? error.message : null,
      });

      if (!error) touchedUsers.add(session.student_id);
      else console.error(`Error closing session ${session.id}:`, error);
    }

    for (const userId of touchedUsers) {
      const { error } = await supabase.rpc('recalculate_student_metrics', {
        target_student_id: userId,
      });
      if (error) console.error(`Metrics recalculation failed for ${userId}:`, error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        closed: results.filter((r) => r.success).length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-voice-sessions function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
