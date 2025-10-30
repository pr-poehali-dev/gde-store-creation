-- Create user_frames table for storing user frame purchases
CREATE TABLE IF NOT EXISTS t_p74122035_gde_store_creation.user_frames (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    frame_id INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, frame_id)
);