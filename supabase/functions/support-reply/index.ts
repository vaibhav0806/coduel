import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { sendPushNotification } from "../_shared/push.ts";

// No CORS headers needed — this is called by Slack, not the app

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Slack URL verification challenge (initial setup)
    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify Slack request signature
    const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
    if (!signingSecret) {
      console.error("Missing SLACK_SIGNING_SECRET");
      return new Response("Server error", { status: 500 });
    }

    const timestamp = req.headers.get("x-slack-request-timestamp");
    const slackSignature = req.headers.get("x-slack-signature");

    if (!timestamp || !slackSignature) {
      return new Response("Missing signature headers", { status: 401 });
    }

    // Reject requests older than 5 minutes (replay protection)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      return new Response("Request too old", { status: 401 });
    }

    // Compute HMAC SHA-256
    const sigBasestring = `v0:${timestamp}:${rawBody}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signingSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(sigBasestring)
    );
    const hex = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const expectedSignature = `v0=${hex}`;

    if (expectedSignature !== slackSignature) {
      console.error("Invalid Slack signature");
      return new Response("Invalid signature", { status: 401 });
    }

    // Process event
    if (body.type !== "event_callback") {
      return new Response("OK", { status: 200 });
    }

    const event = body.event;

    // Ignore bot messages (prevent echo loop)
    if (event.bot_id || event.subtype === "bot_message") {
      return new Response("OK", { status: 200 });
    }

    // Only process threaded replies
    if (!event.thread_ts || event.thread_ts === event.ts) {
      return new Response("OK", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up conversation by thread_ts
    const { data: convo, error: convoErr } = await supabase
      .from("support_conversations")
      .select("id, user_id")
      .eq("slack_thread_ts", event.thread_ts)
      .single();

    if (convoErr || !convo) {
      console.log("No conversation found for thread_ts:", event.thread_ts);
      return new Response("OK", { status: 200 });
    }

    // Check for resolve/close command
    const messageText = (event.text || "").trim().toLowerCase();
    if (messageText === "!resolve" || messageText === "!close") {
      // Update conversation status to resolved
      await supabase
        .from("support_conversations")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", convo.id);

      // Insert a system message visible to the user
      const resolveBody = "This conversation has been marked as resolved. If you need more help, just send a new message.";
      const { data: resolveMsg } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: convo.id,
          sender: "admin",
          body: resolveBody,
        })
        .select("*")
        .single();

      // Increment unread so the user sees the notification
      await supabase.rpc("increment_unread", { conv_id: convo.id });

      // Broadcast to the client in real-time
      {
        const channel = supabase.channel(`support-chat:${convo.id}`);
        if (resolveMsg) {
          await channel.send({
            type: "broadcast",
            event: "new_message",
            payload: resolveMsg,
          });
        }
        await channel.send({
          type: "broadcast",
          event: "status_change",
          payload: { status: "resolved" },
        });
        supabase.removeChannel(channel);
      }

      // Post confirmation reply in Slack thread
      const slackToken = Deno.env.get("SLACK_BOT_TOKEN");
      const channelId = Deno.env.get("SLACK_SUPPORT_CHANNEL_ID");
      if (slackToken && channelId) {
        await fetch("https://slack.com/api/chat.postMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${slackToken}`,
          },
          body: JSON.stringify({
            channel: channelId,
            thread_ts: event.thread_ts,
            text: "Conversation resolved.",
          }),
        });
      }

      // Send push notification to user
      const { data: resolveProfile } = await supabase
        .from("profiles")
        .select("push_token")
        .eq("id", convo.user_id)
        .single();
      if (resolveProfile?.push_token) {
        await sendPushNotification(
          resolveProfile.push_token,
          "Conversation Resolved",
          "Your support conversation has been resolved.",
          { type: "support_resolved" }
        );
      }

      return new Response("OK", { status: 200 });
    }

    // Insert admin reply
    const { data: adminMsg, error: insertErr } = await supabase
      .from("support_messages")
      .insert({
        conversation_id: convo.id,
        sender: "admin",
        body: event.text,
      })
      .select("*")
      .single();

    if (insertErr) {
      console.error("Failed to insert admin message:", insertErr);
      return new Response("DB error", { status: 500 });
    }

    // Atomically increment unread_count
    await supabase.rpc("increment_unread", { conv_id: convo.id });

    // Broadcast to the client in real-time
    if (adminMsg) {
      const channel = supabase.channel(`support-chat:${convo.id}`);
      await channel.send({
        type: "broadcast",
        event: "new_message",
        payload: adminMsg,
      });
      supabase.removeChannel(channel);
    }

    // Send push notification to user
    const { data: replyProfile } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", convo.user_id)
      .single();
    if (replyProfile?.push_token) {
      const truncatedBody = event.text.length > 100
        ? event.text.substring(0, 100) + "..."
        : event.text;
      await sendPushNotification(
        replyProfile.push_token,
        "New Support Reply",
        truncatedBody,
        { type: "support_reply" }
      );
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("support-reply error:", err);
    return new Response("Server error", { status: 500 });
  }
});
