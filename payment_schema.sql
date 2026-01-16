-- Add premium control columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing users to have a trial start of NOW so they don't get locked immediately if they are old users
UPDATE profiles SET trial_start = NOW() WHERE trial_start IS NULL;
