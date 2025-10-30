-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',
    balance DECIMAL(10, 2) DEFAULT 0.00,
    is_banned BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    time_spent_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы игр
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    genre VARCHAR(100) NOT NULL,
    age_rating VARCHAR(10) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    logo_url TEXT NOT NULL,
    file_url TEXT NOT NULL,
    contact_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы рамок
CREATE TABLE IF NOT EXISTS frames (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы покупок игр
CREATE TABLE IF NOT EXISTS game_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    purchase_price DECIMAL(10, 2) NOT NULL,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Создание таблицы покупок рамок
CREATE TABLE IF NOT EXISTS frame_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    frame_id INTEGER REFERENCES frames(id),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, frame_id)
);

-- Создание таблицы активных рамок
CREATE TABLE IF NOT EXISTS active_frames (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    frame_id INTEGER REFERENCES frames(id)
);

-- Создание таблицы друзей
CREATE TABLE IF NOT EXISTS friendships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка админа
INSERT INTO users (email, password, username, role, is_verified) 
VALUES ('suradaniil74@gmail.com', 'Shura1234321', 'Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;