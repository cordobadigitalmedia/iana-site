'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { preliminaryBusinessSchema } from '@/lib/forms/schemas/preliminary-business-schema';
import { sendApplicationEmail, sendApplicantAcknowledgementEmail } from '@/lib/email';

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

    if (validatedData.email) {
      await sendApplicantAcknowledgementEmail({
        to: validatedData.email as string,
        applicationId,
        applicationType: 'preliminary-business',
      });
    }
    
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


