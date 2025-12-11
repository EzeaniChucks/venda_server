-- Migration script to add JSONB wallet field and payment methods table

-- Step 1: Add wallet JSONB column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS wallet JSONB DEFAULT '{"balance": 0, "pendingBalance": 0}'::jsonb;

-- Step 2: Migrate existing wallet_balance to new wallet JSONB structure
UPDATE customers 
SET wallet = jsonb_build_object('balance', COALESCE(wallet_balance, 0), 'pendingBalance', 0)
WHERE wallet IS NULL OR wallet = '{"balance": 0, "pendingBalance": 0}'::jsonb;

-- Step 3: Add wallet JSONB column to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS wallet JSONB DEFAULT '{"balance": 0, "pendingBalance": 0}'::jsonb;

-- Step 4: Add wallet JSONB column to riders table
ALTER TABLE riders 
ADD COLUMN IF NOT EXISTS wallet JSONB DEFAULT '{"balance": 0, "pendingBalance": 0}'::jsonb;

-- Step 5: Create payment_methods table for storing customer card authorizations
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  authorization_code VARCHAR NOT NULL,
  card_type VARCHAR NOT NULL,
  last4 VARCHAR NOT NULL,
  exp_month VARCHAR NOT NULL,
  exp_year VARCHAR NOT NULL,
  bank VARCHAR NOT NULL,
  country_code VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 6: Create index on customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);

-- Step 7: Create index on authorization_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_methods_authorization_code ON payment_methods(authorization_code);

-- Note: We keep the old wallet_balance column for now to avoid data loss
-- It can be manually dropped later after verifying the migration works:
-- ALTER TABLE customers DROP COLUMN IF EXISTS wallet_balance;
