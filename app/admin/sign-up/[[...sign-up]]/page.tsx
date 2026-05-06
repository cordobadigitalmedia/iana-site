import { SignUp } from '@clerk/nextjs';

export default function AdminSignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        signInUrl="/admin"
        afterSignUpUrl="/admin/applications"
        forceRedirectUrl="/admin/applications"
      />
    </div>
  );
}
