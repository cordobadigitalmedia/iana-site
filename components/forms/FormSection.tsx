'use client';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  instruction?: string;
}

export function FormSection({ title, children, instruction }: FormSectionProps) {
  return (
    <div className="mb-8">
      <div className="bg-gray-200 px-4 py-2 mb-4">
        <h2 className="text-xl font-semibold uppercase">{title}</h2>
      </div>
      {instruction && (
        <p className="text-sm text-gray-700 mb-4">{instruction}</p>
      )}
      {children}
    </div>
  );
}


