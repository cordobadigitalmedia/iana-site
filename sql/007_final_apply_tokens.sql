-- Tokens for pre-filling the final application from a preliminary application.
-- When admin sends "Invite for Full Application", a token is stored and the link includes ?token=...
CREATE TABLE IF NOT EXISTS final_apply_tokens (
  token TEXT PRIMARY KEY,
  applicant_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_final_apply_tokens_email ON final_apply_tokens(applicant_email);
