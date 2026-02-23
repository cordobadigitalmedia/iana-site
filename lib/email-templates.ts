/**
 * Draft email templates for admin to send to applicants (editable before sending).
 * Used when status is "Invite for Full Application", "Pending", or "Not Now".
 */
export type EmailTemplateId = 'invite_full_application' | 'pending' | 'not_now';

export type EmailTemplate = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

export const APPLICANT_EMAIL_TEMPLATES: Record<EmailTemplateId, EmailTemplate> = {
  invite_full_application: {
    subject: 'Next step: Full application – IANA Financial',
    bodyText: `As-salamu Alaikum,

Thank you for submitting your preliminary application to IANA Financial.

We have reviewed your application and would like to invite you to complete the full interest-free loan application. This is the next step in our process.

You can access the full application here: {{APPLY_URL}}

Please complete and submit the form at your earliest convenience. If you have any questions, do not hesitate to reach out.

We look forward to receiving your full application.

Was'salam/Peace
IANA Financial
www.ianafinancial.org`,
    bodyHtml: `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>As-salamu Alaikum,</p>
  <p>Thank you for submitting your preliminary application to IANA Financial.</p>
  <p>We have reviewed your application and would like to <strong>invite you to complete the full interest-free loan application</strong>. This is the next step in our process.</p>
  <p>You can access the full application here: <a href="{{APPLY_URL}}">{{APPLY_URL}}</a></p>
  <p>Please complete and submit the form at your earliest convenience. If you have any questions, do not hesitate to reach out.</p>
  <p>We look forward to receiving your full application.</p>
  <p>Was'salam/Peace<br>IANA Financial<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`,
  },
  pending: {
    subject: 'Application status – IANA Financial',
    bodyText: `As-salamu Alaikum,

Thank you for your interest in an interest-free loan from IANA Financial.

We have received your application and it is currently under review (pending). We will be in touch when we have an update or next steps for you.

If you have any questions in the meantime, please do not hesitate to contact us.

Was'salam/Peace
IANA Financial
www.ianafinancial.org`,
    bodyHtml: `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>As-salamu Alaikum,</p>
  <p>Thank you for your interest in an interest-free loan from IANA Financial.</p>
  <p>We have received your application and it is currently <strong>under review (pending)</strong>. We will be in touch when we have an update or next steps for you.</p>
  <p>If you have any questions in the meantime, please do not hesitate to contact us.</p>
  <p>Was'salam/Peace<br>IANA Financial<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`,
  },
  not_now: {
    subject: 'Your application – IANA Financial',
    bodyText: `As-salamu Alaikum,

Thank you for your interest in an interest-free loan from IANA Financial.

We have reviewed your application. At this time we are not able to move forward with your request. We encourage you to reapply in the future if your situation changes.

We wish you well and pray for your success.

Was'salam/Peace
IANA Financial
www.ianafinancial.org`,
    bodyHtml: `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>As-salamu Alaikum,</p>
  <p>Thank you for your interest in an interest-free loan from IANA Financial.</p>
  <p>We have reviewed your application. At this time we are not able to move forward with your request. We encourage you to reapply in the future if your situation changes.</p>
  <p>We wish you well and pray for your success.</p>
  <p>Was'salam/Peace<br>IANA Financial<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`,
  },
};

/** Template IDs that have a draft email (status-based). */
export const STATUS_EMAIL_TEMPLATE_IDS: EmailTemplateId[] = [
  'invite_full_application',
  'pending',
  'not_now',
];

/** Map status to template id for pre-filling when status is set. */
export function getTemplateIdForStatus(status: string): EmailTemplateId | null {
  if (status === 'invite_full_application') return 'invite_full_application';
  if (status === 'pending') return 'pending';
  if (status === 'not_now') return 'not_now';
  return null;
}

function getApplyUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_APP_URL) {
    return `${process.env.NEXT_PUBLIC_APP_URL}/apply/final`;
  }
  if (typeof process !== 'undefined' && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/apply/final`;
  }
  return 'https://www.ianafinancial.org/apply/final';
}

/** Replace placeholders in template (e.g. {{APPLY_URL}}). */
export function fillTemplate(
  template: EmailTemplate
): { subject: string; bodyText: string; bodyHtml: string } {
  const applyUrl = getApplyUrl();
  const replace = (s: string) =>
    s.replace(/\{\{APPLY_URL\}\}/g, applyUrl);
  return {
    subject: replace(template.subject),
    bodyText: replace(template.bodyText),
    bodyHtml: replace(template.bodyHtml),
  };
}
