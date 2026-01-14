-- Add delivered flag and timestamp to private_messages for delivery receipts
ALTER TABLE private_messages
  ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Optional: index delivered_at for queries
CREATE INDEX IF NOT EXISTS idx_private_messages_delivered_at ON private_messages(delivered_at);
