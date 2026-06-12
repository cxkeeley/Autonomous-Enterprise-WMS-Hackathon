-- seed_001_users.sql
-- Dev stage seeder: injects a default Admin user for testing.
-- Password: admin123 (bcrypt hash)
-- Only inserts if the users table is empty.

INSERT INTO users (username, password_hash, role)
SELECT 'admin', '$2b$12$XBu3lxYbb7iOKEANNNBY.umTtIjXcZX/W9iXgKmvl.vPhUfaGjkLy', 'ADMIN'::user_role_enum
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);
