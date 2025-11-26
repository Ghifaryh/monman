-- Create sample users with hashed passwords
-- Run this after your main migrations

-- Create admin user (password: admin123)
-- Bcrypt hash generated with cost 12
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@monman.com',
    '$2a$12$LQxvwgqOMLsXlzNWmvkCbuHNm3MjOJNhE7JRm5X.Bg7k8TgpXK8oe', -- admin123
    'Admin',
    'User',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create test user (password: password123)
-- Bcrypt hash generated with cost 12
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'testuser',
    'test@example.com',
    '$2a$12$K8eOB5HJd6qRqwE5fH7RuOKYvN9bCkXeG7.9WqYzQp5K8UF8M8jQ6', -- password123
    'Test',
    'User',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create demo user (password: demo123)
-- Bcrypt hash generated with cost 12
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'demo',
    'demo@monman.com',
    '$2a$12$9Hm7qE5tK7UqW8pR3oX5YuNvL4ZmG5k8r2E9xW7pQ3jF6t1C2wS4d', -- demo123
    'Demo',
    'User',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create Indonesian user example (password: indonesia123)
INSERT INTO users (
    id, username, email, password_hash, first_name, last_name,
    is_active, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'budi',
    'budi@example.com',
    '$2a$12$X7nF5qH8pL9mW2kR6oY3VuOqZ4xN5bG7t3E1rX8pQ9jD2s5C6wA3e', -- indonesia123
    'Budi',
    'Santoso',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Display created users
SELECT
    username,
    email,
    first_name,
    last_name,
    is_active,
    created_at
FROM users
WHERE username IN ('admin', 'testuser', 'demo', 'budi')
ORDER BY created_at;