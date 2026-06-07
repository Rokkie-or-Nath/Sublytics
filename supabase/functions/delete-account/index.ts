// @ts-nocheck — this file runs on Deno, not Node. Deno globals (Deno.env,
// Deno.serve) and the https:// imports are not visible to the project's
// tsc. They are real and work at runtime once you `supabase functions deploy`.

// ─── Supabase Edge Function: delete-account ────────────────────────────────
// Permanently deletes the calling user. Cascades through profiles /
// subscriptions / activities / insights via the FKs we set up in
// supabase/migrations/001_initial_schema.sql.
//
// DEPLOY:
//   supabase functions deploy delete-account --no-verify-jwt
//
// (No-verify-jwt is required because this function reads the user's JWT from
// the Authorization header itself to figure out which user to delete.)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Pull the user's access token from the Authorization header.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing bearer token" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    // 2. Build an admin client (service_role key — NEVER expose this to the browser).
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // 3. Resolve the calling user from their JWT.
    const { data: { user }, error: userErr } =
      await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    // 4. Delete the user. FK cascades wipe their data automatically.
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (delErr) {
      return json({ error: delErr.message }, 500);
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
