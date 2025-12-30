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


