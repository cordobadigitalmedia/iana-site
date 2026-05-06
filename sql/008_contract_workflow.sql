-- Contract workflow: when final application is approved, admin can generate/send contract;
-- applicant reviews, downloads PDF, uploads signed contract; status becomes contract_signed.

-- Add new status for "Contract signed or accepted"
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check CHECK (
    status IN (
      'submitted',
      'not_now',
      'pending',
      'invite_full_application',
      'awaiting_final_application',
      'awaiting_interview',
      'approved',
      'contract_signed',
      'reviewed',
      'rejected'
    )
  );

-- Contract: token for unique URL, draft content (admin-editable), sent_at, signed PDF URL, signed_at
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS contract_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS contract_draft_content TEXT,
  ADD COLUMN IF NOT EXISTS contract_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signed_contract_url TEXT,
  ADD COLUMN IF NOT EXISTS contract_signed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applications_contract_token ON applications(contract_token) WHERE contract_token IS NOT NULL;
