-- Add updated_at column to users table
ALTER TABLE users 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;

-- Update all existing rows to set updated_at equal to created_at
UPDATE users
SET updated_at = created_at;

-- Make updated_at not null after populating it
ALTER TABLE users
ALTER COLUMN updated_at SET NOT NULL;

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 