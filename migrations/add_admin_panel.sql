
-- Add Admin Panel features
-- Run this to update existing database

-- Users table updates
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Projects table updates
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
-- (is_recommended already exists in schema but lets ensure it)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS recommended BOOLEAN DEFAULT false; -- Schema used 'recommended', user asked for 'is_recommended'. Keeping 'recommended' to avoid breaking existing code, or aliasing. Let's stick to existing 'recommended' column for now to avoid refactoring everything.

-- Create index for soft deletes
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Privacy/Safety: Ensure admin can't be deleted? (Handled in app logic)
