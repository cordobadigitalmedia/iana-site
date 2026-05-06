-- Add status "Invite for Full Application" so admin can invite prelim applicants to complete the full application.
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
      'reviewed',
      'rejected'
    )
  );
