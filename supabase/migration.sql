-- Migration script to update existing database to new structure
-- Run this in your Supabase SQL editor

-- 1. Update application_status enum to new values
ALTER TYPE application_status RENAME TO application_status_old;

CREATE TYPE application_status AS ENUM (
  'started',
  'processing',
  'documents_submitted',
  'payments_processed',
  'completed'
);

-- 2. Add notes column to applications table if it doesn't exist
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS notes JSONB[] DEFAULT '{}';

-- 3. Update existing applications to use new status values
-- Map old statuses to new ones
UPDATE applications 
SET application_status = CASE 
  WHEN application_status::text = 'pending' THEN 'started'::application_status
  WHEN application_status::text = 'review' THEN 'processing'::application_status
  WHEN application_status::text = 'interview' THEN 'processing'::application_status
  WHEN application_status::text = 'accepted' THEN 'completed'::application_status
  WHEN application_status::text = 'rejected' THEN 'completed'::application_status
  WHEN application_status::text = 'deferred' THEN 'processing'::application_status
  ELSE 'started'::application_status
END;

-- 4. Drop the old enum type
DROP TYPE application_status_old;

-- 5. Remove agent_id column if it exists (since we're only using counselors now)
ALTER TABLE applications 
DROP COLUMN IF EXISTS agent_id;

-- 6. Update profiles table default role to counselor
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'counselor';

-- 7. Update any existing agent profiles to counselor
UPDATE profiles 
SET role = 'counselor' 
WHERE role = 'agent';

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_counselor_id ON applications(counselor_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(application_status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- 9. Update RLS policies if needed
-- Allow counselors to see their own applications
DROP POLICY IF EXISTS "counselors_own_applications" ON applications;
CREATE POLICY "counselors_own_applications" ON applications
  FOR ALL USING (
    auth.uid() = counselor_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 10. Grant necessary permissions
GRANT ALL ON applications TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Verification queries (run these to check the migration)
-- SELECT DISTINCT application_status FROM applications;
-- SELECT DISTINCT role FROM profiles;
-- SELECT COUNT(*) FROM applications WHERE notes IS NOT NULL;
