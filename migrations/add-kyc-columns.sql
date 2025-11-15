-- Migration: Add KYC document columns and rejection reason
-- Date: 2025-11-15
-- Description: Adds support for multiple KYC documents and rejection feedback

-- Add new columns to pickup_agent_profiles table
ALTER TABLE pickup_agent_profiles 
ADD COLUMN IF NOT EXISTS driver_license_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS vehicle_registration_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'pickup_agent_profiles'
AND column_name IN ('driver_license_url', 'vehicle_registration_url', 'kyc_rejection_reason');

-- Show sample of existing agents
SELECT 
    a.id,
    u.name,
    u.phone,
    a.kyc_status,
    a.id_document_url,
    a.driver_license_url,
    a.vehicle_registration_url,
    a.kyc_rejection_reason
FROM pickup_agent_profiles a
JOIN users u ON u.id = a.user_id
ORDER BY a.created_at DESC
LIMIT 5;
