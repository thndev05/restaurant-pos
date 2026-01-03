-- Add unique constraint to transaction_id
-- This ensures each transaction ID is unique for third-party payment integration

-- First, check if there are any duplicate transaction IDs (there shouldn't be)
-- If duplicates exist, you'll need to update them first

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "payments_transaction_id_key" ON "payments"("transaction_id");
