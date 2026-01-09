-- Add social media links to profiles table

-- Add new columns for social media URLs
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS telegram_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Create indexes for better query performance (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON profiles(telegram_url) WHERE telegram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_instagram ON profiles(instagram_url) WHERE instagram_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin ON profiles(linkedin_url) WHERE linkedin_url IS NOT NULL;
