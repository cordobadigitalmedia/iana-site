'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { preliminaryEducationSchema } from '@/lib/forms/schemas/preliminary-education-schema';
import { sendApplicationEmail, sendApplicantAcknowledgementEmail } from '@/lib/email';

export async function submitEducationApplication(formData: Record<string, any>) {
  try {
    const validatedData = preliminaryEducationSchema.parse(formData);
    const applicationId = uuidv4();
    
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${'preliminary-education'}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    await sendApplicationEmail({
      applicationId,
      applicationType: 'preliminary-education',
      formData: validatedData
    });

    if (validatedData.email) {
      await sendApplicantAcknowledgementEmail({
        to: validatedData.email as string,
        applicationId,
        applicationType: 'preliminary-education',
      });
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


