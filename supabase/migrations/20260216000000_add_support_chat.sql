-- Support chat tables

CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  slack_thread_ts TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,  -- 'user' or 'admin'
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_messages_conversation_created
  ON support_messages (conversation_id, created_at);

-- RLS
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- support_conversations: users can read/insert/update their own
CREATE POLICY "Users can view own conversation"
  ON support_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversation"
  ON support_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversation"
  ON support_conversations FOR UPDATE
  USING (user_id = auth.uid());

-- support_messages: users can read messages in their conversation
CREATE POLICY "Users can view own messages"
  ON support_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
  );

-- support_messages: users can insert messages where sender = 'user' in their conversation
CREATE POLICY "Users can send messages"
  ON support_messages FOR INSERT
  WITH CHECK (
    sender = 'user'
    AND conversation_id IN (
      SELECT id FROM support_conversations WHERE user_id = auth.uid()
    )
  );

-- Helper function for atomic unread increment (called by support-reply edge function)
CREATE OR REPLACE FUNCTION increment_unread(conv_id UUID)
RETURNS void AS $$
  UPDATE support_conversations
  SET unread_count = unread_count + 1,
      updated_at = now()
  WHERE id = conv_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
