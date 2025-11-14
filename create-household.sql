-- Create household users for testing
-- Password for all: admin123 (hashed with bcrypt)
-- Hash: $2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6

-- Household 1: Jane Doe
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'Jane Doe',
    '+237680000001',
    'household1@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'HOUSEHOLD',
    true,
    true
  )
  RETURNING id
)
INSERT INTO household_profiles (
  user_id,
  household_size,
  preferred_pickup_days,
  subscription_status
)
SELECT 
  id,
  4,
  '["Monday", "Thursday"]',
  'ACTIVE'
FROM new_user;

-- Household 2: John Smith
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'John Smith',
    '+237680000002',
    'household2@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'HOUSEHOLD',
    true,
    true
  )
  RETURNING id
)
INSERT INTO household_profiles (
  user_id,
  household_size,
  preferred_pickup_days,
  subscription_status
)
SELECT 
  id,
  3,
  '["Tuesday", "Friday"]',
  'ACTIVE'
FROM new_user;

-- Household 3: Sarah Johnson
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'Sarah Johnson',
    '+237680000003',
    'household3@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'HOUSEHOLD',
    true,
    true
  )
  RETURNING id
)
INSERT INTO household_profiles (
  user_id,
  household_size,
  preferred_pickup_days
)
SELECT 
  id,
  2,
  '["Wednesday", "Saturday"]'
FROM new_user;

-- Verify created households
SELECT 
  u.id as user_id,
  u.name,
  u.phone,
  u.email,
  u.role,
  h.id as household_id,
  h.household_size,
  h.preferred_pickup_days,
  h.subscription_status
FROM users u
JOIN household_profiles h ON u.id = h.user_id
WHERE u.role = 'HOUSEHOLD'
ORDER BY u.created_at DESC;
