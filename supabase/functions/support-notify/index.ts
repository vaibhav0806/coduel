import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "No authorization header" }, 401);
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { conversation_id, message_body } = await req.json();
    if (!conversation_id || !message_body) {
      return jsonResponse({ error: "Missing conversation_id or message_body" }, 400);
    }

    // Service role client for DB reads/writes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch conversation (verify ownership)
    const { data: convo, error: convoErr } = await supabase
      .from("support_conversations")
      .select("*")
      .eq("id", conversation_id)
      .eq("user_id", user.id)
      .single();

    if (convoErr || !convo) {
      return jsonResponse({ error: "Conversation not found" }, 404);
    }

    // Fetch user profile for display name
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .single();

    const displayName = profile?.display_name || profile?.username || "User";

    const slackToken = Deno.env.get("SLACK_BOT_TOKEN");
    const channelId = Deno.env.get("SLACK_SUPPORT_CHANNEL_ID");

    if (!slackToken || !channelId) {
      console.error("Missing Slack configuration");
      return jsonResponse({ error: "Support unavailable" }, 503);
    }

    let threadTs = convo.slack_thread_ts;

    if (!threadTs) {
      // First message: create a new thread
      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${slackToken}`,
        },
        body: JSON.stringify({
          channel: channelId,
          text: `*New support request from ${displayName}*\n\n${message_body}`,
        }),
      });

      const slackData = await slackRes.json();
      if (!slackData.ok) {
        console.error("Slack error:", slackData.error);
        return jsonResponse({ error: "Failed to send to Slack" }, 500);
      }

      threadTs = slackData.ts;

      // Save thread_ts to conversation
      await supabase
        .from("support_conversations")
        .update({
          slack_thread_ts: threadTs,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversation_id);
    } else {
      // Follow-up: reply in existing thread
      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${slackToken}`,
        },
        body: JSON.stringify({
          channel: channelId,
          thread_ts: threadTs,
          text: `*${displayName}:*\n${message_body}`,
        }),
      });

      const slackData = await slackRes.json();
      if (!slackData.ok) {
        console.error("Slack error:", slackData.error);
        return jsonResponse({ error: "Failed to send to Slack" }, 500);
      }

      await supabase
        .from("support_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);
    }

    return jsonResponse({ status: "sent" });
  } catch (err) {
    console.error("support-notify error:", err);
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
