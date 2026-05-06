-- Checklist / flowchart fields for applicant journey (final application).
-- Guarantor and references "received" come from response_links; "approved" is set by admin.
-- Interview and loan approval complete the flow; then system drafts agreement + award email.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS guarantor_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS references_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS interview_date DATE,
  ADD COLUMN IF NOT EXISTS interview_notes TEXT,
  ADD COLUMN IF NOT EXISTS loan_approved_at TIMESTAMPTZ;
