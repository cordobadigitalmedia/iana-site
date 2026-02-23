/**
 * Helpers for application display (admin list/detail).
 * Extracts applicant name and phone from form_data (preliminary vs final use different fields).
 */
export function getApplicantName(formData: Record<string, unknown> | null): string {
  if (!formData || typeof formData !== 'object') return '—';
  const legalName = formData.legal_name;
  if (typeof legalName === 'string' && legalName.trim()) return legalName.trim();
  const first = formData.first_name;
  const last = formData.last_name;
  const middle = formData.middle_name;
  const parts = [first, middle, last].filter((x) => typeof x === 'string' && (x as string).trim());
  if (parts.length) return (parts as string[]).join(' ').trim();
  return '—';
}

export function getApplicantPhone(formData: Record<string, unknown> | null): string {
  if (!formData || typeof formData !== 'object') return '—';
  const phone = formData.phone;
  if (typeof phone === 'string' && phone.trim()) return phone.trim();
  const cell = formData.cell;
  if (typeof cell === 'string' && cell.trim()) return cell.trim();
  return '—';
}

/** Human-readable status labels (person's application journey). */
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  not_now: 'Not Now',
  pending: 'Pending',
  invite_full_application: 'Invite for Full Application',
  awaiting_final_application: 'Awaiting Final Application',
  awaiting_interview: 'Awaiting Interview',
  approved: 'Approved',
  reviewed: 'Reviewed',
  rejected: 'Rejected',
};

export function getStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

/** Human-readable application type for display. */
export const APPLICATION_TYPE_LABELS: Record<string, string> = {
  'preliminary-personal': 'Preliminary – Personal/Emergency',
  'preliminary-education': 'Preliminary – Education',
  'preliminary-business': 'Preliminary – Business/Institutional',
  final: 'Final Interest-Free Loan Application',
};

export function getApplicationTypeLabel(type: string): string {
  return APPLICATION_TYPE_LABELS[type] ?? type;
}

/** One row per applicant (grouped by email) for checklist table. */
export type ApplicantRow = {
  applicantEmail: string | null;
  applicantName: string;
  applicantPhone: string;
  /** Application id to link to (prefer final if exists). */
  primaryApplicationId: string;
  prelimSubmittedAt: string | null;
  finalApplicationId: string | null;
  finalSubmittedAt: string | null;
  guarantorReceived: boolean;
  guarantorApproved: boolean;
  referencesReceived: boolean;
  referencesApproved: boolean;
  referenceCount: number;
  /** Number of references who have submitted. */
  referencesReceivedCount: number;
  interviewDate: string | null;
  interviewNotes: string | null;
  loanApprovedAt: string | null;
  status: string;
};

type AppRow = {
  id: string;
  application_type: string;
  status: string;
  submitted_at: string | null;
  applicant_email: string | null;
  form_data: Record<string, unknown> | null;
  guarantor_approved?: boolean | null;
  references_approved?: boolean | null;
  interview_date?: string | null;
  interview_notes?: string | null;
  loan_approved_at?: string | null;
};

type LinkRow = {
  application_id: string;
  role: string;
  submitted_at: string | null;
};

/** Build applicant-centric rows from applications + response_links. */
export function buildApplicantRows(
  applications: AppRow[],
  responseLinks: LinkRow[]
): ApplicantRow[] {
  const byEmail = new Map<string, AppRow[]>();
  for (const app of applications) {
    const key = app.applicant_email ?? `__no_email_${app.id}`;
    if (!byEmail.has(key)) byEmail.set(key, []);
    byEmail.get(key)!.push(app);
  }
  const linksByApp = new Map<string, LinkRow[]>();
  for (const link of responseLinks) {
    if (!linksByApp.has(link.application_id)) linksByApp.set(link.application_id, []);
    linksByApp.get(link.application_id)!.push(link);
  }

  const rows: ApplicantRow[] = [];
  for (const [emailKey, apps] of byEmail) {
    const prelim = apps.filter((a) => a.application_type !== 'final');
    const finalApp = apps.find((a) => a.application_type === 'final');
    const prelimSubmitted = prelim.length
      ? prelim.reduce((latest, a) => {
          const t = a.submitted_at;
          return t && (!latest || t > latest) ? t : latest;
        }, null as string | null)
      : null;
    const primaryApp = finalApp ?? prelim[0];
    if (!primaryApp) continue;

    const links = finalApp ? linksByApp.get(finalApp.id) ?? [] : [];
    const guarantorLinks = links.filter((l) => l.role === 'guarantor');
    const referenceLinks = links.filter((l) => l.role === 'reference');
    const guarantorReceived = guarantorLinks.some((l) => l.submitted_at != null);
    const refsSubmitted = referenceLinks.filter((l) => l.submitted_at != null);
    const referencesReceived = refsSubmitted.length > 0;
    const referenceCount = referenceLinks.length;

    const formData = primaryApp.form_data ?? {};
    rows.push({
      applicantEmail: emailKey.startsWith('__no_email_') ? null : emailKey,
      applicantName: getApplicantName(formData as Record<string, unknown>),
      applicantPhone: getApplicantPhone(formData as Record<string, unknown>),
      primaryApplicationId: primaryApp.id,
      prelimSubmittedAt: prelimSubmitted,
      finalApplicationId: finalApp?.id ?? null,
      finalSubmittedAt: finalApp?.submitted_at ?? null,
      guarantorReceived,
      guarantorApproved: finalApp?.guarantor_approved ?? false,
      referencesReceived,
      referencesApproved: finalApp?.references_approved ?? false,
      referenceCount,
      referencesReceivedCount: refsSubmitted.length,
      interviewDate: finalApp?.interview_date ?? null,
      interviewNotes: finalApp?.interview_notes ?? null,
      loanApprovedAt: finalApp?.loan_approved_at ?? null,
      status: primaryApp.status,
    });
  }

  return rows.sort((a, b) => {
    const aDate = a.finalSubmittedAt ?? a.prelimSubmittedAt ?? '';
    const bDate = b.finalSubmittedAt ?? b.prelimSubmittedAt ?? '';
    return bDate.localeCompare(aDate);
  });
}
