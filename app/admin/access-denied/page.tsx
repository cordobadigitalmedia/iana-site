import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminAccessDeniedPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Access denied</h1>
      <p className="text-muted-foreground mb-6">
        You do not have admin access. If you believe this is an error, please contact an administrator.
      </p>
      <Button asChild>
        <Link href="/admin">Back to sign in</Link>
      </Button>
    </div>
  );
}
