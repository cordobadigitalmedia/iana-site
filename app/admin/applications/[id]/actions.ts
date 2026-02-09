'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/admin-auth';
import { sql } from '@/lib/db';

export async function updateApplicationStatus(applicationId: string, formData: FormData): Promise<void> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    redirect('/admin/access-denied');
  }

  const status = formData.get('status') as string | null;
  if (!status || !['submitted', 'reviewed', 'approved', 'rejected'].includes(status)) {
    return;
  }

  await sql`
    UPDATE applications
    SET status = ${status}
    WHERE id = ${applicationId}
  `;

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath('/admin/applications');
}
