'use server';

import { submitResponseLink } from '@/lib/respond';

export async function submitGuarantorResponse(
  token: string,
  answers: Record<string, string>,
  documentUrl: string
) {
  return submitResponseLink(token, answers, documentUrl);
}
