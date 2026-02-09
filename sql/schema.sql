-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL CHECK (application_type IN ('preliminary-personal', 'preliminary-education', 'preliminary-business', 'final')),
  submitted_at TIMESTAMP DEFAULT NOW(),
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved', 'rejected')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  applicant_email TEXT
);

-- Create index on application_type for faster queries
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Response links: one row per guarantor or reference slot (final applications only)
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

-- Admin users: roles in DB; Clerk handles auth only
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_clerk_user_id ON admin_users(clerk_user_id);

