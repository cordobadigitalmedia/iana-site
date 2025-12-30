'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GuarantorReferencesSectionProps {
  formData: Record<string, any>;
  onChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
}

export function GuarantorReferencesSection({ formData, onChange, errors }: GuarantorReferencesSectionProps) {
  const renderTableRow = (label: string, fieldName: string, type: 'text' | 'email' | 'tel' = 'text', required = false) => {
    return (
      <div className="grid grid-cols-2 border-b border-gray-300">
        <div className="p-3 bg-gray-50 border-r border-gray-300">
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
            className={`border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors?.[fieldName] ? 'border-red-500' : ''}`}
            required={required}
          />
          {errors?.[fieldName] && (
            <p className="text-sm text-red-500 mt-1">{errors[fieldName]}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Guarantor Section */}
      <div>
        <p className="text-sm italic text-gray-600 mb-4">
          Please provide your guarantor&apos;s contact information.
        </p>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          {renderTableRow('Full name', 'guarantor_full_name', 'text', true)}
          {renderTableRow('Relationship to applicant', 'guarantor_relationship', 'text', true)}
          {renderTableRow('Email address', 'guarantor_email', 'email', true)}
          {renderTableRow('Phone number', 'guarantor_phone', 'tel', true)}
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
                {renderTableRow('Full name', `reference${refNum}_full_name`, 'text', true)}
                {renderTableRow('Relationship to applicant (ex. supervisor, teacher, friend)', `reference${refNum}_relationship`, 'text', true)}
                {renderTableRow('Organization (if applicable)', `reference${refNum}_organization`, 'text', false)}
                {renderTableRow('Email address', `reference${refNum}_email`, 'email', true)}
                {renderTableRow('Phone number', `reference${refNum}_phone`, 'tel', true)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

