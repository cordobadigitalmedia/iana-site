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


