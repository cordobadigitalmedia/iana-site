-- Migration: response_links and admin_users tables
-- Run this if you already have the applications table and need to add the new tables.

CREATE TABLE IF NOT EXISTS response_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('guarantor', 'reference')),
  reference_index INT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  answers JSONB,
  document_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_response_links_token ON response_links(token);
CREATE INDEX IF NOT EXISTS idx_response_links_application_id ON response_links(application_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_clerk_user_id ON admin_users(clerk_user_id);
