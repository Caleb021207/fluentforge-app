import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the calling user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const teacherId = claimsData.claims.sub;

    // Parse and validate body
    const body = await req.json();
    const { students, class_id, native_language, target_language } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return new Response(
        JSON.stringify({ error: "students array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!class_id) {
      return new Response(
        JSON.stringify({ error: "class_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify teacher owns this class
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: classData } = await adminClient
      .from("classes")
      .select("id, teacher_id")
      .eq("id", class_id)
      .single();

    if (!classData || classData.teacher_id !== teacherId) {
      return new Response(
        JSON.stringify({ error: "You don't own this class" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const created: Array<{ name: string; email: string; password: string }> = [];
    const errors: Array<{ email: string; error: string }> = [];

    for (const student of students) {
      const { name, email, password } = student;
      if (!email || !password) {
        errors.push({ email: email || "unknown", error: "Email and password required" });
        continue;
      }

      if (password.length < 6) {
        errors.push({ email, error: "Password must be at least 6 characters" });
        continue;
      }

      try {
        // Create the user with admin API
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            display_name: name || email.split("@")[0],
            native_language: native_language || undefined,
            target_language: target_language || undefined,
          },
        });

        if (createError) {
          errors.push({ email, error: createError.message });
          continue;
        }

        if (userData.user) {
          // Update the profile role to student
          await adminClient
            .from("profiles")
            .update({
              role: "student",
              display_name: name || email.split("@")[0],
              native_language: native_language || null,
              target_language: target_language || null,
            })
            .eq("id", userData.user.id);

          // Enroll in class
          await adminClient.from("student_enrollments").insert({
            class_id,
            student_id: userData.user.id,
            status: "active",
          });

          created.push({ name: name || email.split("@")[0], email, password });
        }
      } catch (err: any) {
        errors.push({ email, error: err.message || "Unknown error" });
      }
    }

    return new Response(
      JSON.stringify({ created, errors, total: students.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
