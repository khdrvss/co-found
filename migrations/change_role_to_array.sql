-- Change role from single VARCHAR to array of TEXT to support multiple job roles

-- First, create a temporary column to store the array
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[];

-- Copy existing single role to the array (if it exists)
UPDATE profiles SET roles = ARRAY[role] WHERE role IS NOT NULL AND role != '';

-- Drop the old single role column
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Rename the new column to 'roles' (it's already named correctly)
-- No need to rename since we created it as 'roles'

-- Note: The column is now 'roles' (plural) instead of 'role' (singular)
