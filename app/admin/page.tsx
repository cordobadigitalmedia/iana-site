import { SignIn } from '@clerk/nextjs';

export default function AdminSignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        signUpUrl="/admin/sign-up"
        afterSignInUrl="/admin/applications"
        forceRedirectUrl="/admin/applications"
      />
    </div>
  );
}
