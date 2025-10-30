-- Add system settings table for maintenance mode
CREATE TABLE IF NOT EXISTS t_p74122035_gde_store_creation.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default maintenance mode setting
INSERT INTO t_p74122035_gde_store_creation.system_settings (key, value) 
VALUES ('maintenance_mode', 'false')
ON CONFLICT (key) DO NOTHING;