'use server';

import { sql } from '@/lib/db';

/** Look up application by contract token; return draft content and signed state. */
export async function getContractByToken(token: string): Promise<{
  found: boolean;
  contractContent: string | null;
  alreadySigned: boolean;
}> {
  const rows = await sql`
    SELECT contract_draft_content, contract_signed_at
    FROM applications
    WHERE contract_token = ${token} AND application_type = 'final'
    LIMIT 1
  `;
  const row = rows[0] as { contract_draft_content: string | null; contract_signed_at: string | null } | undefined;
  if (!row) return { found: false, contractContent: null, alreadySigned: false };
  return {
    found: true,
    contractContent: row.contract_draft_content,
    alreadySigned: !!row.contract_signed_at,
  };
}

/** Record signed contract upload and set status to contract_signed. */
export async function submitSignedContract(
  token: string,
  signedContractUrl: string
): Promise<{ error?: string }> {
  const trimmed = signedContractUrl?.trim();
  if (!trimmed) return { error: 'Signed contract file is required.' };

  const rows = await sql`
    SELECT id, contract_signed_at
    FROM applications
    WHERE contract_token = ${token} AND application_type = 'final'
    LIMIT 1
  `;
  const row = rows[0] as { id: string; contract_signed_at: string | null } | undefined;
  if (!row) return { error: 'Invalid or expired contract link.' };
  if (row.contract_signed_at) return { error: 'This contract has already been submitted.' };

  const now = new Date().toISOString();
  await sql`
    UPDATE applications
    SET signed_contract_url = ${trimmed},
        contract_signed_at = ${now},
        status = 'contract_signed'
    WHERE id = ${row.id}
  `;

  return {};
}
