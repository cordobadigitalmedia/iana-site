-- Application status: journey for the person's entire application (not just prelim).
-- SUBMITTED = when the client submitted. Then: Not Now, Pending, Awaiting Final Application, Awaiting Interview, Approved.
-- Keep legacy values so existing rows remain valid.
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check CHECK (
    status IN (
      'submitted',
      'not_now',
      'pending',
      'awaiting_final_application',
      'awaiting_interview',
      'approved',
      'reviewed',
      'rejected'
    )
  );
