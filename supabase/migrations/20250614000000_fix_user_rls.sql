-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can read own profile" ON users;

-- Create a new policy that allows any authenticated user to read all user profiles
CREATE POLICY "All authenticated users can read user profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true); 