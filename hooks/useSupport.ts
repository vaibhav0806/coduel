import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { SupportMessage } from "@/types/database";

export function useSupport() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch or create conversation, load messages, reset unread
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const init = async () => {
      // Try to fetch existing conversation
      let { data: convo } = await supabase
        .from("support_conversations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!convo) {
        // Create one lazily
        const { data: newConvo, error } = await supabase
          .from("support_conversations")
          .insert({ user_id: user.id })
          .select("*")
          .single();

        if (error || !newConvo) {
          console.error("[Support] Failed to create conversation:", error);
          if (mounted) setLoading(false);
          return;
        }
        convo = newConvo;
      }

      if (!mounted) return;
      setConversationId(convo.id);

      // Load messages
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("*")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: true });

      if (mounted) {
        setMessages(msgs ?? []);
        setLoading(false);
      }

      // Reset unread count (user is viewing the chat)
      if (convo.unread_count > 0) {
        await supabase
          .from("support_conversations")
          .update({ unread_count: 0 })
          .eq("id", convo.id);
      }

      // Subscribe to new messages via postgres_changes
      const channel = supabase
        .channel(`support:${convo.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `conversation_id=eq.${convo.id}`,
          },
          (payload) => {
            const newMsg = payload.new as SupportMessage;
            setMessages((prev) => {
              // Deduplicate (optimistic insert may already have it)
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // If admin message came in while user is viewing, reset unread
            if (newMsg.sender === "admin") {
              supabase
                .from("support_conversations")
                .update({ unread_count: 0 })
                .eq("id", convo!.id);
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    init();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!user || !conversationId || !body.trim()) return;

      setSending(true);
      const trimmed = body.trim();

      // Insert message into DB (RLS allows user inserts)
      const { data: msg, error: insertErr } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversationId,
          sender: "user",
          body: trimmed,
        })
        .select("*")
        .single();

      if (insertErr || !msg) {
        console.error("[Support] Failed to insert message:", insertErr);
        setSending(false);
        return;
      }

      // Optimistically add to state
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Notify Slack via edge function
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) {
          console.warn("[Support] No auth token — skipping Slack notify");
        } else {
          const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/support-notify`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              conversation_id: conversationId,
              message_body: trimmed,
            }),
          });
          const resBody = await res.text();
          if (!res.ok) {
            console.warn("[Support] Slack notify error:", res.status, resBody);
          } else {
            console.log("[Support] Slack notify OK:", resBody);
          }
        }
      } catch (err) {
        console.warn("[Support] Slack notify failed:", err);
      }

      setSending(false);
    },
    [user, conversationId]
  );

  return { messages, loading, sending, sendMessage };
}

/**
 * Lightweight hook for checking unread count (used by Settings screen).
 * Does NOT subscribe to realtime — just a one-time query.
 */
export function useSupportUnread() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("support_conversations")
      .select("unread_count")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setUnreadCount(data?.unread_count ?? 0);
      });
  }, [user]);

  return unreadCount;
}
