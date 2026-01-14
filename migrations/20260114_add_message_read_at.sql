-- Add read_at timestamp for per-message read receipts
ALTER TABLE private_messages
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_private_messages_read_at ON private_messages(read_at);
