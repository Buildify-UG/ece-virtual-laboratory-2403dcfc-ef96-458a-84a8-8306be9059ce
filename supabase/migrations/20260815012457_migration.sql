-- Create function to handle admin bootstrap
CREATE OR REPLACE FUNCTION assign_admin_role_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email matches the admin email
  IF NEW.id IS NOT NULL AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.id 
    AND email = 'bhimavarapulokeshwarareddy13@gmail.com'
  ) THEN
    -- Assign admin role
    UPDATE user_profiles 
    SET role = 'admin' 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS assign_admin_role_on_profile_create ON user_profiles;

-- Create trigger to assign admin role on profile creation
CREATE TRIGGER assign_admin_role_on_profile_create
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION assign_admin_role_on_signup();

-- Ensure user_profiles table has proper constraints and defaults
ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- Add unique constraint on username
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Add index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Verify component_submissions table has all needed fields and proper RLS
ALTER TABLE component_submissions
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON component_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_by ON component_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON component_submissions(created_at DESC);

-- Fix RLS policies for component_submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON component_submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON component_submissions;
DROP POLICY IF EXISTS "Users can update own pending submissions" ON component_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON component_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON component_submissions;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON component_submissions FOR SELECT
USING (auth.uid() = submitted_by OR 
       (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

-- Users can create submissions
CREATE POLICY "Users can create submissions"
ON component_submissions FOR INSERT
WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
ON component_submissions FOR UPDATE
USING (auth.uid() = submitted_by AND status = 'pending')
WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Admins can update any submission
CREATE POLICY "Admins can update submissions"
ON component_submissions FOR UPDATE
USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

-- Ensure components table only shows approved components to normal users
DROP POLICY IF EXISTS "Public can view approved components" ON components;
DROP POLICY IF EXISTS "Creators can view own components" ON components;

-- Public can view approved components
CREATE POLICY "Public can view approved components"
ON components FOR SELECT
USING (is_active = true);

-- Admins can view all components
CREATE POLICY "Admins can view all components"
ON components FOR SELECT
USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' OR is_active = true);

-- Only admins can insert components
CREATE POLICY "Admins can create components"
ON components FOR INSERT
WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can update components
CREATE POLICY "Admins can update components"
ON components FOR UPDATE
USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can delete components
CREATE POLICY "Admins can delete components"
ON components FOR DELETE
USING ((SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin');