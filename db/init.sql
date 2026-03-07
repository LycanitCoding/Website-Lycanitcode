-- Initialize PostgreSQL database with tables and seed data

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- Seed test user (username: testuser, password: test123, hashed with bcryptjs rounds=10)
INSERT INTO users (username, email, password) 
VALUES ('testuser', 'test@example.com', '$2a$10$EJXMTmIIgkeO9LbW0L/qm.VnOzGlRmtePamwdl17HEdihUotDATwG')
ON CONFLICT (username) DO NOTHING;