-- Create approved pickup agents
-- Password for all agents: admin123 (hashed with bcrypt)
-- Hash: $2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6

-- Agent 1: John Agent
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'John Agent',
    '+237670000001',
    'agent1@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'AGENT',
    true,
    true
  )
  RETURNING id
)
INSERT INTO pickup_agent_profiles (
  user_id,
  kyc_status,
  average_rating,
  total_completed_pickups
)
SELECT 
  id,
  'APPROVED',
  0,
  0
FROM new_user;

-- Agent 2: Mary Collector (experienced)
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'Mary Collector',
    '+237670000002',
    'agent2@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'AGENT',
    true,
    true
  )
  RETURNING id
)
INSERT INTO pickup_agent_profiles (
  user_id,
  kyc_status,
  average_rating,
  total_completed_pickups
)
SELECT 
  id,
  'APPROVED',
  4.5,
  25
FROM new_user;

-- Agent 3: Paul Driver (top performer)
WITH new_user AS (
  INSERT INTO users (name, phone, email, password_hash, role, is_active, is_verified)
  VALUES (
    'Paul Driver',
    '+237670000003',
    'agent3@wastemanagement.cm',
    '$2b$10$C/uBZrgYqldOb9dFM7M4jeM0GW/Jop4sbQYD.Hrk.PKN0LLWzQUh6',
    'AGENT',
    true,
    true
  )
  RETURNING id
)
INSERT INTO pickup_agent_profiles (
  user_id,
  kyc_status,
  average_rating,
  total_completed_pickups
)
SELECT 
  id,
  'APPROVED',
  4.8,
  50
FROM new_user;

-- Verify created agents
SELECT 
  u.id,
  u.name,
  u.phone,
  u.email,
  u.role,
  p.kyc_status,
  p.average_rating,
  p.total_completed_pickups
FROM users u
JOIN pickup_agent_profiles p ON u.id = p.user_id
WHERE u.role = 'AGENT'
ORDER BY u.created_at DESC;
