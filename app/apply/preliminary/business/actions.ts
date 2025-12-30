'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { preliminaryBusinessSchema } from '@/lib/forms/schemas/preliminary-business-schema';
import { sendApplicationEmail } from '@/lib/email';

export async function submitBusinessApplication(formData: Record<string, any>) {
  try {
    const validatedData = preliminaryBusinessSchema.parse(formData);
    const applicationId = uuidv4();
    
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${'preliminary-business'}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    await sendApplicationEmail({
      applicationId,
      applicationType: 'preliminary-business',
      formData: validatedData
    });
    
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


