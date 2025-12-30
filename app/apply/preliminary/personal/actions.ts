'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { preliminaryPersonalSchema } from '@/lib/forms/schemas/preliminary-personal-schema';
import { sendApplicationEmail } from '@/lib/email';

export async function submitPersonalApplication(formData: Record<string, any>) {
  try {
    // Validate form data
    const validatedData = preliminaryPersonalSchema.parse(formData);
    
    // Generate unique ID
    const applicationId = uuidv4();
    
    // Insert into database
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${'preliminary-personal'}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    // Send email
    await sendApplicationEmail({
      applicationId,
      applicationType: 'preliminary-personal',
      formData: validatedData
    });
    
    // Update email_sent status
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


