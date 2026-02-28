'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { preliminaryPersonalSchema } from '@/lib/forms/schemas/preliminary-personal-schema';
import { sendApplicationEmail, sendApplicantAcknowledgementEmail } from '@/lib/email';

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
    
    await sendApplicationEmail({
      applicationId,
      applicationType: 'preliminary-personal',
      formData: validatedData
    });

    if (validatedData.email) {
      await sendApplicantAcknowledgementEmail({
        to: validatedData.email as string,
        applicationId,
        applicationType: 'preliminary-personal',
      });
    }
    
    // Update email_sent status
    await sql`
      UPDATE applications SET email_sent = true, email_sent_at = NOW() WHERE id = ${applicationId}
    `;
    
    return { success: true, applicationId };
  } catch (error: any) {
    console.error('Error submitting application:', error);
    const issues = error?.name === 'ZodError' ? (error.issues ?? error.errors) : null;
    if (issues && Array.isArray(issues)) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of issues) {
        const path = issue.path?.filter(Boolean);
        const key = path && path.length > 0 ? (path[0] as string) : 'form';
        const msg = issue.message || 'Invalid value';
        if (!fieldErrors[key] || key === 'form') {
          fieldErrors[key] = msg;
        }
      }
      return {
        success: false,
        error: 'Please fix the highlighted fields below.',
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      };
    }
    return { success: false, error: 'An error occurred while submitting your application.' };
  }
}


