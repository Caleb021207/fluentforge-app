import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { requireUser } from "../_shared/authGuard.ts";

/**
 * Teacher-side class roster management.
 *
 * The client cannot do this directly: looking a student up by email requires
 * reading a profile the teacher does not yet have RLS access to (the student is
 * not in their class *yet*). So the lookup runs here with the service role,
 * behind an explicit is_teacher_of_class check on the caller.
 *
 * actions:
 *   list           -> roster for a class
 *   add_by_email   -> enroll an existing student account
 *   remove         -> drop an enrollment
 */

function service() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const gate = await requireUser(req, corsHeaders);
  if (gate.error) return gate.error;
  const callerId = gate.userId!;

  let body: { action?: string; classId?: string; email?: string; studentId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = String(body.action ?? "");
  const classId = String(body.classId ?? "");
  if (!["list", "add_by_email", "remove"].includes(action)) {
    return json({ error: "Unknown action" }, 400);
  }
  if (!/^[0-9a-f-]{36}$/i.test(classId)) {
    return json({ error: "classId must be a uuid" }, 400);
  }

  const db = service();

  // Authorization: caller must teach this class (or be an admin).
  const [{ data: isTeacher }, { data: isAdmin }] = await Promise.all([
    db.rpc("is_teacher_of_class", { _teacher: callerId, _class: classId }),
    db.rpc("has_role", { _user_id: callerId, _role: "admin" }),
  ]);
  if (isTeacher !== true && isAdmin !== true) {
    return json({ error: "You do not teach this class." }, 403);
  }

  if (action === "list") {
    const { data, error } = await db
      .from("student_enrollments")
      .select("id, student_id, status, enrolled_at, profiles:student_id (display_name, email, target_level)")
      .eq("class_id", classId)
      .order("enrolled_at", { ascending: true });
    if (error) return json({ error: error.message }, 400);
    return json({ roster: data ?? [] });
  }

  if (action === "add_by_email") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || !email.includes("@") || email.length > 255) {
      return json({ error: "A valid email address is required." }, 400);
    }

    const { data: profile, error: lookupErr } = await db
      .from("profiles")
      .select("id, display_name, role")
      .ilike("email", email)
      .maybeSingle();
    if (lookupErr) return json({ error: lookupErr.message }, 400);
    if (!profile) {
      return json({ error: "No account found with that email. Ask the student to sign up first." }, 404);
    }
    if (profile.role === "teacher" || profile.role === "admin") {
      return json({ error: "That account is a staff account, not a student." }, 400);
    }

    const { error: insertErr } = await db
      .from("student_enrollments")
      .upsert(
        { class_id: classId, student_id: profile.id, status: "active" },
        { onConflict: "class_id,student_id" },
      );
    if (insertErr) return json({ error: insertErr.message }, 400);

    return json({ added: { id: profile.id, display_name: profile.display_name } });
  }

  // remove
  const studentId = String(body.studentId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(studentId)) {
    return json({ error: "studentId must be a uuid" }, 400);
  }
  const { error: delErr } = await db
    .from("student_enrollments")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);
  if (delErr) return json({ error: delErr.message }, 400);

  return json({ removed: studentId });
});
