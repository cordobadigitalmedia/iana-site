import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

export interface AdminUser {
  id: string;
  clerk_user_id: string;
  email: string | null;
  role: string;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const rows = await sql`
    SELECT id, clerk_user_id, email, role
    FROM admin_users
    WHERE clerk_user_id = ${userId}
    LIMIT 1
  `;
  const row = rows[0] as AdminUser | undefined;
  return row ?? null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'admin') {
    return null as never;
  }
  return admin;
}
