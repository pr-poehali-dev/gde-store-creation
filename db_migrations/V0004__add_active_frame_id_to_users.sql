-- Add active_frame_id column to users table
ALTER TABLE t_p74122035_gde_store_creation.users 
ADD COLUMN IF NOT EXISTS active_frame_id INTEGER DEFAULT NULL;