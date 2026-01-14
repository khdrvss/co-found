-- Add composite index for private_messages to speed up conversation queries
CREATE INDEX IF NOT EXISTS idx_private_messages_sender_receiver ON private_messages(sender_id, receiver_id);

-- Ensure created_at index exists (already present in schema, but keep for safety)
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at DESC);
