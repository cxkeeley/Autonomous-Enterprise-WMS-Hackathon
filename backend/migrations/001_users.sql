-- 001_users.sql
-- Sprint 1: Security & Master Data Foundation
-- Creates user_role enum and users table for JWT authentication.

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
