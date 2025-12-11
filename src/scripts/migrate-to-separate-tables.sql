-- Migration script to replace universal users table with 4 separate tables

-- Step 1: Create the 4 new tables

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  business_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Riders table
CREATE TABLE IF NOT EXISTS riders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Migrate data from users table to the appropriate new tables
INSERT INTO customers (id, email, password_hash, full_name, phone, avatar_url, is_active, is_verified, created_at, updated_at)
SELECT id, email, password_hash, full_name, phone, avatar_url, is_active, is_verified, created_at, updated_at
FROM users
WHERE role = 'customer'
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, email, password_hash, business_name, phone, avatar_url, is_active, is_verified, created_at, updated_at)
SELECT id, email, password_hash, full_name AS business_name, phone, avatar_url, is_active, is_verified, created_at, updated_at
FROM users
WHERE role = 'vendor'
ON CONFLICT (id) DO NOTHING;

INSERT INTO riders (id, email, password_hash, full_name, phone, avatar_url, is_active, is_verified, created_at, updated_at)
SELECT id, email, password_hash, full_name, phone, avatar_url, is_active, is_verified, created_at, updated_at
FROM users
WHERE role = 'rider'
ON CONFLICT (id) DO NOTHING;

INSERT INTO admins (id, email, password_hash, full_name, phone, avatar_url, is_active, created_at, updated_at)
SELECT id, email, password_hash, full_name, phone, avatar_url, is_active, created_at, updated_at
FROM users
WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Step 3: The foreign key columns (user_id) in other tables will now reference the appropriate table
-- Since we're keeping the same IDs, the foreign keys will still work
-- They will reference customers for cart/wishlist/orders/transactions
-- They will reference vendors for products
-- They will reference riders for order deliveries

-- Note: We're NOT dropping the users table yet for safety
-- You can drop it manually after verifying everything works:
-- DROP TABLE users;
