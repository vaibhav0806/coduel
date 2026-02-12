import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { corsHeaders } from "../_shared/cors.ts";
import { sendPushNotification } from "../_shared/push.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Verify caller auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, target_user_id } = await req.json();

    if (type === "follow") {
      if (!target_user_id) {
        return new Response(JSON.stringify({ error: "Missing target_user_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Fetch caller's username and target's push_token in parallel
      const [callerRes, targetRes] = await Promise.all([
        serviceClient
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single(),
        serviceClient
          .from("profiles")
          .select("push_token")
          .eq("id", target_user_id)
          .single(),
      ]);

      const pushToken = targetRes.data?.push_token;
      if (!pushToken) {
        return new Response(JSON.stringify({ status: "no_token" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const username = callerRes.data?.username || "Someone";
      await sendPushNotification(
        pushToken,
        "New Follower",
        `${username} started following you`,
        { type: "follow", follower_id: user.id }
      );

      return new Response(JSON.stringify({ status: "sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown notification type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
