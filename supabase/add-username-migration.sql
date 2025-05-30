-- Migration to add username column to profiles table
-- Run this in your Supabase SQL editor

-- 1. Add username column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- 2. Create a unique index on username to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 3. Update existing profiles to have usernames based on their email
-- This extracts the part before @ from the email and adds a number if needed
UPDATE profiles 
SET username = CASE 
  WHEN username IS NULL THEN 
    CONCAT(
      REGEXP_REPLACE(
        SPLIT_PART(
          (SELECT email FROM auth.users WHERE auth.users.id = profiles.id), 
          '@', 
          1
        ), 
        '[^a-zA-Z0-9]', 
        '', 
        'g'
      ),
      '_',
      SUBSTRING(profiles.id::text, 1, 4)
    )
  ELSE username
END
WHERE username IS NULL;

-- 4. Make username NOT NULL after populating existing records
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

-- 5. Update the trigger function to include username from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'counselor'),
    COALESCE(NEW.raw_user_meta_data->>'name', 
             CONCAT(
               REGEXP_REPLACE(
                 SPLIT_PART(NEW.email, '@', 1), 
                 '[^a-zA-Z0-9]', 
                 '', 
                 'g'
               ),
               '_',
               SUBSTRING(NEW.id::text, 1, 4)
             )
    ),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update RLS policies to allow reading usernames
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

-- 7. Allow admins to update any profile, users can update their own
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Profile updates" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

-- 8. Allow admins to insert new profiles (for creating counselors)
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

-- Verification queries (run these to check the migration)
-- SELECT id, username, role FROM profiles LIMIT 10;
-- SELECT COUNT(*) FROM profiles WHERE username IS NOT NULL;
-- SELECT username, COUNT(*) FROM profiles GROUP BY username HAVING COUNT(*) > 1; -- Should return no rows (no duplicates)
