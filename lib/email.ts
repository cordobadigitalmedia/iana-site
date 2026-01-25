import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  try {
    await resend.emails.send({
      from: 'IANA Financial <noreply@ianafinancial.org>',
      to: process.env.APPLICATION_EMAIL || 'applications@ianafinancial.org',
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
  } catch (error) {
    console.error('Error sending application email:', error);
    throw error;
  }
}

interface GuarantorEmailData {
  guarantorName: string;
  applicantName: string;
  applicationId: string;
}

export async function sendGuarantorEmail({
  guarantorName,
  applicantName,
  applicationId,
  email,
}: GuarantorEmailData & { email: string }) {
  try {
    await resend.emails.send({
      from: 'IANA Financial <noreply@ianafinancial.org>',
      to: email,
      subject: `Reference Request - IANA Financial Loan Application`,
      text: `Dear ${guarantorName},\n\n${applicantName} has listed you as a guarantor for their interest-free loan application with IANA Financial (Application ID: ${applicationId}).\n\nAs a guarantor, you would be responsible for ensuring the loan is repaid if the applicant is unable to fulfill their obligations.\n\nWe may contact you to discuss this application further. If you have any questions or concerns, please feel free to reach out to us.\n\nThank you for your consideration.\n\nBest regards,\nIANA Financial Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reference Request - IANA Financial Loan Application</h2>
          <p>Dear ${guarantorName},</p>
          <p>${applicantName} has listed you as a guarantor for their interest-free loan application with IANA Financial (Application ID: <strong>${applicationId}</strong>).</p>
          <p>As a guarantor, you would be responsible for ensuring the loan is repaid if the applicant is unable to fulfill their obligations.</p>
          <p>We may contact you to discuss this application further. If you have any questions or concerns, please feel free to reach out to us.</p>
          <p>Thank you for your consideration.</p>
          <p>Best regards,<br>IANA Financial Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending guarantor email:', error);
    // Don't throw - we don't want to fail the application submission if email fails
  }
}

interface ReferenceEmailData {
  referenceName: string;
  applicantName: string;
  applicationId: string;
}

export async function sendReferenceEmail({
  referenceName,
  applicantName,
  applicationId,
  email,
}: ReferenceEmailData & { email: string }) {
  try {
    await resend.emails.send({
      from: 'IANA Financial <noreply@ianafinancial.org>',
      to: email,
      subject: `Reference Request - IANA Financial Loan Application`,
      text: `Dear ${referenceName},\n\n${applicantName} has listed you as a reference for their interest-free loan application with IANA Financial (Application ID: ${applicationId}).\n\nWe may contact you to provide a reference for the applicant. If you have any questions or concerns, please feel free to reach out to us.\n\nThank you for your time and consideration.\n\nBest regards,\nIANA Financial Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reference Request - IANA Financial Loan Application</h2>
          <p>Dear ${referenceName},</p>
          <p>${applicantName} has listed you as a reference for their interest-free loan application with IANA Financial (Application ID: <strong>${applicationId}</strong>).</p>
          <p>We may contact you to provide a reference for the applicant. If you have any questions or concerns, please feel free to reach out to us.</p>
          <p>Thank you for your time and consideration.</p>
          <p>Best regards,<br>IANA Financial Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending reference email:', error);
    // Don't throw - we don't want to fail the application submission if email fails
  }
}


