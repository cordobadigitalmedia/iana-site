'use client';

import { Button } from '@/components/ui/button';

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  children?: React.ReactNode;
}

export function FormSubmitButton({ isSubmitting, children }: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full"
    >
      {isSubmitting ? 'Submitting...' : children || 'Submit Application'}
    </Button>
  );
}


