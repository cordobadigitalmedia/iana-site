'use server';

import { sql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { checkBotId } from 'botid/server';
import { preliminaryUnifiedSchema } from '@/lib/forms/schemas/preliminary-unified-schema';
import { sendApplicationEmail, sendApplicantAcknowledgementEmail } from '@/lib/email';

export async function submitPreliminaryApplication(formData: Record<string, any>) {
  try {
    // Check if the request is from a bot
    const verification = await checkBotId();
    
    if (verification.isBot) {
      return { success: false, error: 'Bot detected. Access denied.' };
    }
    
    // Validate form data (schema will map user-friendly labels to database values)
    const validatedData = preliminaryUnifiedSchema.parse(formData);
    
    // Determine the application type for database storage
    const applicationType = validatedData.application_type;
    const dbApplicationType = `preliminary-${applicationType}`;
    
    // Generate unique ID
    const applicationId = uuidv4();
    
    // Insert into database
    await sql`
      INSERT INTO applications (id, application_type, form_data, applicant_email)
      VALUES (${applicationId}, ${dbApplicationType}, ${JSON.stringify(validatedData)}, ${validatedData.email || null})
    `;
    
    await sendApplicationEmail({
      applicationId,
      applicationType: dbApplicationType,
      formData: validatedData
    });

    if (validatedData.email) {
      await sendApplicantAcknowledgementEmail({
        to: validatedData.email as string,
        applicationId,
        applicationType: dbApplicationType,
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
