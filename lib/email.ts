/**
 * Email sending via Resend.
 *
 * Required in .env.local:
 *   RESEND_API_KEY=re_xxxx  (from Resend dashboard → API Keys)
 *
 * Optional:
 *   APPLICATION_EMAIL      – where to send new-application notifications (default: applications@ianafinancial.org)
 *   APPLICATION_FROM_EMAIL – "from" address for all emails
 *
 * If you don't receive emails: Resend requires the "from" domain to be verified.
 * For testing without verifying a domain, set:
 *   APPLICATION_FROM_EMAIL=onboarding@resend.dev
 *   APPLICATION_EMAIL=your-email@example.com  (Resend free tier only delivers to your sign-up email)
 */
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

/** From address for all emails. For testing without domain verification, use Resend sandbox: onboarding@resend.dev */
function getFromAddress(): string {
  return (
    process.env.APPLICATION_FROM_EMAIL ||
    'IANA Financial <noreply@ianafinancial.org>'
  );
}

function ensureResendConfigured(): void {
  if (!RESEND_API_KEY || RESEND_API_KEY.trim() === '') {
    console.error(
      '[Email] RESEND_API_KEY is not set in .env.local – emails will not be sent. Add RESEND_API_KEY=re_xxxx from your Resend dashboard.'
    );
    throw new Error('RESEND_API_KEY is not set. Add it to .env.local to send emails.');
  }
}

interface ApplicationEmailData {
  applicationId: string;
  applicationType: string;
  formData: Record<string, any>;
}

function formatFormData(formData: Record<string, any>): string {
  let formatted = '';
  for (const [key, value] of Object.entries(formData)) {
    const label = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    formatted += `${label}: ${value}\n`;
  }
  return formatted;
}

export async function sendApplicationEmail({
  applicationId,
  applicationType,
  formData,
}: ApplicationEmailData) {
  const applicationTypeLabels: Record<string, string> = {
    'preliminary-personal': 'Preliminary Application - Personal/Emergency',
    'preliminary-education': 'Preliminary Application - Education',
    'preliminary-business': 'Preliminary Application - Business/Institutional',
    'final': 'Final Interest-Free Loan Application',
  };

  const typeLabel = applicationTypeLabels[applicationType] || applicationType;
  const formattedData = formatFormData(formData);

  ensureResendConfigured();
  const to = process.env.APPLICATION_EMAIL || 'applications@ianafinancial.org';

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject: `New ${typeLabel} - ID: ${applicationId}`,
      text: `A new application has been submitted.\n\nApplication ID: ${applicationId}\nApplication Type: ${typeLabel}\nSubmitted At: ${new Date().toISOString()}\n\nForm Data:\n${formattedData}`,
      html: `
        <h2>New Application Submitted</h2>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p><strong>Application Type:</strong> ${typeLabel}</p>
        <p><strong>Submitted At:</strong> ${new Date().toISOString()}</p>
        <h3>Form Data:</h3>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${formattedData}</pre>
      `,
    });
    if (error) {
      console.error('[Email] Application notification failed:', error);
      throw new Error(`Resend: ${error.message}`);
    }
    console.log('[Email] Application notification sent to', to, '– id:', data?.id);
  } catch (error) {
    console.error('Error sending application email:', error);
    throw error;
  }
}

/** Link-only email to guarantor: they complete the form at the unique link */
export async function sendGuarantorLinkEmail({
  applicantName,
  email,
  linkUrl,
}: {
  applicantName: string;
  email: string;
  linkUrl: string;
}) {
  const text = `As-salamu Alaikum! Salams/Peace Dear

We pray you and yours are well.

You have been listed as a guarantor for ${applicantName} for an interest-free loan application from Iana Financial.

Please complete the guarantor form and upload your government-issued ID at the link below. This link is unique and tied to this application.

${linkUrl}

Many thanks and God reward you for your good intentions.

Was'salam/Peace
Iana Applications
www.ianafinancial.org`;

  const html = `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>As-salamu Alaikum! Salams/Peace Dear</p>
  <p>We pray you and yours are well.</p>
  <p>You have been listed as a guarantor for <strong>${applicantName}</strong> for an interest-free loan application from Iana Financial.</p>
  <p>Please complete the guarantor form and upload your government-issued ID at the link below. This link is unique and tied to this application.</p>
  <p><a href="${linkUrl}" style="color: #2563eb;">Complete your guarantor form</a></p>
  <p>Many thanks and God reward you for your good intentions.</p>
  <p>Was'salam/Peace<br>Iana Applications<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`;

  ensureResendConfigured();
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: 'Complete your guarantor form – Iana Financial',
      text,
      html,
    });
    if (error) console.error('[Email] Guarantor link failed:', error);
    else console.log('[Email] Guarantor link sent to', email, '– id:', data?.id);
  } catch (error) {
    console.error('Error sending guarantor link email:', error);
  }
}

/** Link-only email to reference: they complete the form at the unique link */
export async function sendReferenceLinkEmail({
  applicantName,
  email,
  linkUrl,
}: {
  applicantName: string;
  email: string;
  linkUrl: string;
}) {
  const text = `Salam/Peace

We pray you and yours are well.

You have been listed as a reference for ${applicantName} for an interest-free loan application from Iana Financial.

Please complete the reference form and upload your letter of reference at the link below. This link is unique and tied to this application.

${linkUrl}

Many thanks and God reward you for your honesty and sincere advice.

Was'salam/Peace
Iana Applications
www.ianafinancial.org`;

  const html = `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>Salam/Peace</p>
  <p>We pray you and yours are well.</p>
  <p>You have been listed as a reference for <strong>${applicantName}</strong> for an interest-free loan application from Iana Financial.</p>
  <p>Please complete the reference form and upload your letter of reference at the link below. This link is unique and tied to this application.</p>
  <p><a href="${linkUrl}" style="color: #2563eb;">Complete your reference form</a></p>
  <p>Many thanks and God reward you for your honesty and sincere advice.</p>
  <p>Was'salam/Peace<br>Iana Applications<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`;

  ensureResendConfigured();
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: 'Complete your reference form – Iana Financial',
      text,
      html,
    });
    if (error) console.error('[Email] Reference link failed:', error);
    else console.log('[Email] Reference link sent to', email, '– id:', data?.id);
  } catch (error) {
    console.error('Error sending reference link email:', error);
  }
}

/** Applicant acknowledgement (dummy content for now) */
export async function sendApplicantAcknowledgementEmail({
  to,
  applicationId,
  applicationType,
}: {
  to: string;
  applicationId: string;
  applicationType: string;
}) {
  const typeLabels: Record<string, string> = {
    'preliminary-personal': 'Preliminary Application (Personal/Emergency)',
    'preliminary-education': 'Preliminary Application (Education)',
    'preliminary-business': 'Preliminary Application (Business/Institutional)',
    'final': 'Final Interest-Free Loan Application',
  };
  const typeLabel = typeLabels[applicationType] || applicationType;

  const text = `Thank you for submitting your application.

We have received your ${typeLabel} and will review it in due course.

Your Application ID: ${applicationId}

Please save this ID for your records. You may be contacted using the email address you provided.

Was'salam/Peace
Iana Applications
www.ianafinancial.org`;

  const html = `
<div style="font-family: -apple-system, sans-serif; color: rgb(0,0,0); max-width: 600px;">
  <p>Thank you for submitting your application.</p>
  <p>We have received your <strong>${typeLabel}</strong> and will review it in due course.</p>
  <p>Your Application ID: <strong>${applicationId}</strong></p>
  <p>Please save this ID for your records. You may be contacted using the email address you provided.</p>
  <p>Was'salam/Peace<br>Iana Applications<br><a href="http://www.ianafinancial.org">www.ianafinancial.org</a></p>
</div>`;

  ensureResendConfigured();
  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject: `Application received – Iana Financial (${applicationId})`,
      text,
      html,
    });
    if (error) console.error('[Email] Applicant acknowledgement failed:', error);
    else console.log('[Email] Applicant acknowledgement sent to', to, '– id:', data?.id);
  } catch (error) {
    console.error('Error sending applicant acknowledgement email:', error);
  }
}
