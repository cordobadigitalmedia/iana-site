-- Notes, comments, and approvals on applications (admin only can add).
-- Reviewer role: view-only access to applications; no edit/approve.
-- application_notes: one row per note/comment/approval; multiple approvals per application.
CREATE TABLE IF NOT EXISTS application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'comment', 'approval')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_created_at ON application_notes(created_at DESC);

-- Optional: document that admin_users.role can be 'admin' or 'reviewer' (no DB constraint; app enforces).
-- Reviewer: view applications and notes only. Admin: full edit, notes, approvals.
