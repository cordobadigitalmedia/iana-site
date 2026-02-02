'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { checkBotId } from 'botid/server';
import { finalApplicationSchema } from '@/lib/forms/schemas/final-application-schema';
import { sendApplicationEmail, sendGuarantorEmail, sendReferenceEmail } from '@/lib/email';

export async function submitFinalApplication(formData: Record<string, any>) {
  try {
    // Check if the request is from a bot
    const verification = await checkBotId();
    
    if (verification.isBot) {
      return { success: false, error: 'Bot detected. Access denied.' };
    }
    
    const validatedData = finalApplicationSchema.parse(formData);
    const applicationId = uuidv4();
    
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${'final'}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    await sendApplicationEmail({
      applicationId,
      applicationType: 'final',
      formData: validatedData
    });
    
    const applicantName = [validatedData.first_name, validatedData.middle_name, validatedData.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    // Send email to guarantor
    if (validatedData.guarantor_email && validatedData.guarantor_full_name && applicantName) {
      await sendGuarantorEmail({
        email: validatedData.guarantor_email as string,
        guarantorName: validatedData.guarantor_full_name as string,
        applicantName,
        applicationId,
      });
    }
    
    // Send emails to references
    const references = [
      { email: validatedData.reference1_email, name: validatedData.reference1_full_name },
      { email: validatedData.reference2_email, name: validatedData.reference2_full_name },
      { email: validatedData.reference3_email, name: validatedData.reference3_full_name },
    ];
    
    for (const reference of references) {
      if (reference.email && reference.name && applicantName) {
        await sendReferenceEmail({
          email: reference.email as string,
          referenceName: reference.name as string,
          applicantName,
          applicationId,
        });
      }
    }
    
    await sql`
      UPDATE applications SET email_sent = true, email_sent_at = NOW() WHERE id = ${applicationId}
    `;
    
    return { success: true, applicationId };
  } catch (error: any) {
    console.error('Error submitting application:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed. Please check your inputs.' };
    }
    return { success: false, error: 'An error occurred while submitting your application.' };
  }
}


