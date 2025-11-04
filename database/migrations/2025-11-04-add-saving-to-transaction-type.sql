-- Add 'saving' value to enum transaction_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'transaction_type' AND e.enumlabel = 'saving'
  ) THEN
    ALTER TYPE transaction_type ADD VALUE 'saving';
  END IF;
END $$;

