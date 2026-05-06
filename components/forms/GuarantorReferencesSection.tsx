'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GuarantorReferencesSectionProps {
  formData: Record<string, any>;
  onChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
}

type FieldSpec = { label: string; fieldName: string; type: 'text' | 'email' | 'tel'; required: boolean };

export function GuarantorReferencesSection({ formData, onChange, errors }: GuarantorReferencesSectionProps) {
  const renderCell = (label: string, fieldName: string, type: 'text' | 'email' | 'tel' = 'text', required = false) => (
    <>
      <div className="p-3 bg-gray-50 md:border-r border-gray-300">
        <Label htmlFor={fieldName} className="font-normal">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      <div className="p-3">
        <Input
          id={fieldName}
          name={fieldName}
          type={type}
          value={formData[fieldName] || ''}
          onChange={(e) => onChange(fieldName, e.target.value)}
          className={`bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-offset-1 ${errors?.[fieldName] ? 'border-red-500' : ''}`}
          required={required}
        />
        {errors?.[fieldName] && (
          <p className="text-sm text-red-500 mt-1">{errors[fieldName]}</p>
        )}
      </div>
    </>
  );

  const renderRow4 = (a: FieldSpec, b: FieldSpec) => (
    <div key={a.fieldName} className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-300">
      {renderCell(a.label, a.fieldName, a.type, a.required)}
      {renderCell(b.label, b.fieldName, b.type, b.required)}
    </div>
  );

  const renderRow2 = (a: FieldSpec) => (
    <div key={a.fieldName} className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-300">
      {renderCell(a.label, a.fieldName, a.type, a.required)}
      <div className="p-3 bg-gray-50 md:col-span-2" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Guarantor Section */}
      <div>
        <p className="text-sm italic text-gray-600 mb-4">
          Please provide your guarantor&apos;s contact information.
        </p>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          {renderRow4(
            { label: 'Full name', fieldName: 'guarantor_full_name', type: 'text', required: true },
            { label: 'Relationship to applicant', fieldName: 'guarantor_relationship', type: 'text', required: true }
          )}
          {renderRow4(
            { label: 'Email address', fieldName: 'guarantor_email', type: 'email', required: true },
            { label: 'Phone number', fieldName: 'guarantor_phone', type: 'tel', required: true }
          )}
        </div>
      </div>

      {/* References Section */}
      <div>
        <p className="text-sm italic text-gray-600 mb-4">
          Please list three references that lana may contact.
        </p>
        <div className="space-y-6">
          {[1, 2, 3].map((refNum) => (
            <div key={refNum}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Reference {refNum}
              </h4>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                {renderRow4(
                  { label: 'Full name', fieldName: `reference${refNum}_full_name`, type: 'text', required: true },
                  { label: 'Relationship to applicant (ex. supervisor, teacher, friend)', fieldName: `reference${refNum}_relationship`, type: 'text', required: true }
                )}
                {renderRow4(
                  { label: 'Organization (if applicable)', fieldName: `reference${refNum}_organization`, type: 'text', required: false },
                  { label: 'Email address', fieldName: `reference${refNum}_email`, type: 'email', required: true }
                )}
                {renderRow2(
                  { label: 'Phone number', fieldName: `reference${refNum}_phone`, type: 'tel', required: true }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

