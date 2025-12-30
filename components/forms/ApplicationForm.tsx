'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { FormSubmitButton } from './FormSubmitButton';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { DocumentUpload } from './DocumentUpload';
import { EducationSection } from './EducationSection';
import { VolunteerSection } from './VolunteerSection';
import { GuarantorReferencesSection } from './GuarantorReferencesSection';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'tel' | 'file';
  required: boolean;
  section?: string;
  options?: string[];
  placeholder?: string;
  width?: 'full' | 'half';
  rowLabel?: string;
  isTotal?: boolean;
  conditionalRequired?: {
    field: string;
    value: string;
  };
  conditionalShow?: {
    field: string;
    value: string;
  };
}

interface ApplicationFormProps {
  fields: FieldDefinition[];
  sections: string[];
  formKey: string;
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; applicationId?: string; error?: string }>;
}

export function ApplicationForm({ fields, sections, formKey, onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Restore form data from localStorage
  const handleRestore = (data: Record<string, any>) => {
    setFormData(data);
  };

  const { clearStorage } = useFormAutoSave(formKey, formData, handleRestore);

  // Update form data
  const handleFieldChange = (name: string, value: string | string[]) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      setLastSaved(new Date());
      return updated;
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await onSubmit(formData);
      if (result.success && result.applicationId) {
        clearStorage();
        window.location.href = `/apply/success/${result.applicationId}`;
      } else {
        setErrors({ submit: result.error || 'An error occurred. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a field should be shown (conditional visibility)
  const shouldShowField = (field: FieldDefinition): boolean => {
    if (!field.conditionalShow) return true;
    const { field: conditionField, value: conditionValue } = field.conditionalShow;
    const fieldValue = formData[conditionField];
    
    // Handle undefined/null/empty values
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }
    
    // For checkboxes, check if the value array includes the condition value
    if (Array.isArray(fieldValue)) {
      const isChecked = fieldValue.length > 0 && fieldValue.includes(conditionValue);
      return isChecked;
    }
    return fieldValue === conditionValue;
  };

  // Group fields by section
  const fieldsBySection = sections.reduce((acc, section) => {
    acc[section] = fields.filter((field) => field.section === section);
    return acc;
  }, {} as Record<string, FieldDefinition[]>);

  // Fields without a section
  const fieldsWithoutSection = fields.filter((field) => !field.section);

  // Helper function to get table headers
  const getTableHeaders = (section: string) => {
    if (section === 'Assets') {
      return ['', 'Amount / Estimated Value', 'Type / Description'];
    } else if (section === 'Total Liabilities') {
      return ['Amount owing', 'Monthly payment'];
    } else if (section === 'Monthly Living Expenses') {
      return ['Expense', 'Amount'];
    }
    return [];
  };

  // Helper function to check if a field is required (including conditional requirements)
  const isFieldRequired = (field: FieldDefinition): boolean => {
    if (field.required) return true;
    if (field.conditionalRequired) {
      const { field: conditionField, value: conditionValue } = field.conditionalRequired;
      const fieldValue = formData[conditionField];
      // For checkboxes, check if the value array includes the condition value
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return fieldValue === conditionValue;
    }
    return false;
  };

  // Helper function to render a field (handles file uploads separately)
  const renderField = (field: FieldDefinition) => {
    if (field.type === 'file') {
      return (
        <DocumentUpload
          name={field.name}
          label={field.label}
          required={isFieldRequired(field)}
          value={formData[field.name] as string | undefined}
          onChange={(url) => handleFieldChange(field.name, url || '')}
          error={errors[field.name]}
        />
      );
    }
    return (
      <FormField
        name={field.name}
        label={field.label}
        type={field.type}
        required={isFieldRequired(field)}
        value={formData[field.name] || (field.type === 'checkbox' ? [] : '')}
        onChange={(value) => handleFieldChange(field.name, value)}
        error={errors[field.name]}
        options={field.options}
        placeholder={field.placeholder}
      />
    );
  };

  // Create a key that changes when conditional fields change to force re-render
  const conditionalFieldsKey = JSON.stringify(
    fields
      .filter(f => f.conditionalShow)
      .map(f => ({ name: f.name, show: shouldShowField(f) }))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map((section) => {
        const sectionFields = fieldsBySection[section];
        if (!sectionFields || sectionFields.length === 0) return null;

        const instruction = section === 'Education' 
          ? "For student loans: please list your current or proposed educational institution, program, and your graduation year."
          : section === 'Required Documents'
          ? "Before submitting your final loan application, please ensure that you have uploaded all required documents. Additional documents are required for business/institutional loans and educational loans as indicated below."
          : undefined;

        const isTableSection = section === 'Assets' || section === 'Total Liabilities' || section === 'Monthly Living Expenses';

        return (
          <FormSection 
            key={`${section}-${section === 'Required Documents' ? conditionalFieldsKey : ''}`} 
            title={section} 
            instruction={instruction}
          >
            {isTableSection ? (
              <div className="border border-gray-300">
                {/* Table Header */}
                {(() => {
                  const headers = getTableHeaders(section);
                  if (headers.length > 0) {
                    const isAssets = section === 'Assets';
                    return (
                      <div className={`grid ${isAssets ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-gray-300 bg-gray-100 border-b border-gray-300`}>
                        {headers.map((header, idx) => (
                          <div key={idx} className="p-3 font-semibold text-sm">
                            {header}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {(() => {
                  const renderedFields: JSX.Element[] = [];
                  const regularFields: FieldDefinition[] = [];
                  const totalFields: FieldDefinition[] = [];
                  
                  // Separate regular fields from total fields
                  sectionFields.forEach(field => {
                    if (field.isTotal) {
                      totalFields.push(field);
                    } else {
                      regularFields.push(field);
                    }
                  });
                  
                  let i = 0;
                  
                  // Render regular rows
                  while (i < regularFields.length) {
                    const field = regularFields[i];
                    
                    // Skip field if it shouldn't be shown
                    if (!shouldShowField(field)) {
                      i += 1;
                      continue;
                    }
                    
                    const nextField = regularFields[i + 1];
                    const isHalfWidth = field.width === 'half';
                    const nextIsHalfWidth = nextField?.width === 'half';
                    
                    if (isHalfWidth && nextIsHalfWidth && shouldShowField(nextField)) {
                      // Render two fields side by side with optional row label
                      if (section === 'Assets') {
                        // Assets: 3 columns - Label | Amount | Type
                        renderedFields.push(
                          <div key={field.name} className="border-b border-gray-300">
                            <div className="grid grid-cols-3 divide-x divide-gray-300">
                              <div className="p-4">
                                {field.rowLabel && (
                                  <label className="block text-sm font-medium">
                                    {field.rowLabel}
                                  </label>
                                )}
                              </div>
                              <div className="p-4">
                                {renderField(field)}
                              </div>
                              <div className="p-4">
                                {renderField(nextField)}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Other sections: 2 columns
                        renderedFields.push(
                          <div key={field.name} className="border-b border-gray-300">
                            <div className="grid grid-cols-2 divide-x divide-gray-300">
                              <div className="p-4">
                                {field.rowLabel && (
                                  <label className="block text-sm font-medium mb-2">
                                    {field.rowLabel}
                                  </label>
                                )}
                                {renderField(field)}
                              </div>
                              <div className="p-4">
                                {renderField(nextField)}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      i += 2; // Skip next field as it's already rendered
                    } else {
                      // Render single field (full width) - for Monthly Living Expenses
                      renderedFields.push(
                        <div key={field.name} className="border-b border-gray-300">
                          <div className="grid grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4">
                              <label className="block text-sm font-medium">
                                {field.label}
                              </label>
                            </div>
                            <div className="p-4">
                              {renderField(field)}
                            </div>
                          </div>
                        </div>
                      );
                      i += 1;
                    }
                  }
                  
                  // Render total row(s)
                  if (totalFields.length > 0) {
                    if (section === 'Assets') {
                      // Assets has a single total field - 3 columns
                      const totalField = totalFields[0];
                      renderedFields.push(
                        <div key={totalField.name} className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-3 divide-x divide-gray-300">
                            <div className="p-4">
                              {totalField.rowLabel && (
                                <label className="block text-sm font-semibold">
                                  {totalField.rowLabel}
                                </label>
                              )}
                            </div>
                            <div className="p-4">
                              {renderField(totalField)}
                            </div>
                            <div className="p-4"></div>
                          </div>
                        </div>
                      );
                    } else if (section === 'Total Liabilities') {
                      // Total Liabilities has two total fields
                      const totalAmountField = totalFields.find(f => f.name.includes('amount_owing'));
                      const totalPaymentField = totalFields.find(f => f.name.includes('monthly_payment'));
                      renderedFields.push(
                        <div key="liabilities-total" className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4">
                              {totalAmountField?.rowLabel && (
                                <label className="block text-sm font-semibold mb-2">
                                  {totalAmountField.rowLabel}
                                </label>
                              )}
                              {totalAmountField && renderField(totalAmountField)}
                            </div>
                            <div className="p-4">
                              {totalPaymentField && renderField(totalPaymentField)}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (section === 'Monthly Living Expenses') {
                      // Monthly Living Expenses has a single total field
                      const totalField = totalFields[0];
                      renderedFields.push(
                        <div key={totalField.name} className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4">
                              <label className="block text-sm font-semibold">
                                {totalField.label}
                              </label>
                            </div>
                            <div className="p-4">
                              {renderField(totalField)}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }
                  
                  return renderedFields;
                })()}
              </div>
            ) : section === 'Education' ? (
              <EducationSection
                formData={formData}
                onChange={(updatedData) => {
                  setFormData(updatedData);
                  setLastSaved(new Date());
                }}
                errors={errors}
              />
            ) : section === 'Volunteerism and Extracurricular Activities' ? (
              <div className="space-y-6">
                <VolunteerSection
                  formData={formData}
                  onChange={(updatedData) => {
                    setFormData(updatedData);
                    setLastSaved(new Date());
                  }}
                  errors={errors}
                />
                {(() => {
                  // Render extracurricular_activities field separately
                  const extracurricularField = sectionFields.find(
                    f => f.name === 'extracurricular_activities'
                  );
                  if (extracurricularField && shouldShowField(extracurricularField)) {
                    return (
                      <div className="mt-6">
                        {renderField(extracurricularField)}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : section === 'Guarantor and References' ? (
              <GuarantorReferencesSection
                formData={formData}
                onChange={(name, value) => {
                  handleFieldChange(name, value);
                }}
                errors={errors}
              />
            ) : (
              <div className="space-y-4">
                {(() => {
                  const renderedFields: JSX.Element[] = [];
                  let i = 0;
                  
                  while (i < sectionFields.length) {
                    const field = sectionFields[i];
                    
                    // Skip field if it shouldn't be shown
                    if (!shouldShowField(field)) {
                      i += 1;
                      continue;
                    }
                    
                    const nextField = sectionFields[i + 1];
                    const isHalfWidth = field.width === 'half';
                    const nextIsHalfWidth = nextField?.width === 'half';
                    
                    if (isHalfWidth && nextIsHalfWidth && nextField && shouldShowField(nextField)) {
                      // Render two fields side by side with optional row label
                      renderedFields.push(
                        <div key={field.name}>
                          {field.rowLabel && (
                            <label className="block text-sm font-medium mb-2">
                              {field.rowLabel}
                            </label>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            {renderField(field)}
                            {renderField(nextField)}
                          </div>
                        </div>
                      );
                      i += 2; // Skip next field as it's already rendered
                    } else {
                      // Render single field (full width)
                      renderedFields.push(
                        <div key={field.name}>
                          {field.rowLabel && (
                            <label className="block text-sm font-medium mb-1">
                              {field.rowLabel}
                            </label>
                          )}
                          {renderField(field)}
                        </div>
                      );
                      i += 1;
                    }
                  }
                  
                  return renderedFields;
                })()}
            </div>
            )}
          </FormSection>
        );
      })}

      {fieldsWithoutSection.length > 0 && (
        <div className="space-y-4">
          {fieldsWithoutSection.map((field) => (
            <div key={field.name}>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}

      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      <div className="flex items-center justify-between">
        <AutoSaveIndicator lastSaved={lastSaved} />
        <FormSubmitButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
}


