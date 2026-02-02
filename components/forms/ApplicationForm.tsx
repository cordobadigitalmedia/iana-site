'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useFormAutoSave } from '@/hooks/useFormAutoSave';
import { FormSection } from './FormSection';
import { FormField } from './FormField';
import { FormSubmitButton } from './FormSubmitButton';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { DocumentUpload } from './DocumentUpload';
import { EducationSection } from './EducationSection';
import { VolunteerSection } from './VolunteerSection';
import { GuarantorReferencesSection } from './GuarantorReferencesSection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'tel' | 'file';
  required: boolean;
  section?: string;
  options?: string[];
  placeholder?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  rowLabel?: string;
  isTotal?: boolean;
  note?: string;
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

  // Credit cards: update one cell in the repeating list
  const handleCreditCardChange = (index: number, field: 'amount_owing' | 'description' | 'monthly_payment', value: string | number) => {
    setFormData((prev) => {
      const list = Array.isArray(prev.credit_cards) && prev.credit_cards.length > 0
        ? prev.credit_cards
        : [{ amount_owing: '', description: '', monthly_payment: '' }];
      const updated = [...list];
      if (!updated[index]) updated[index] = { amount_owing: '', description: '', monthly_payment: '' };
      updated[index] = { ...updated[index], [field]: value };
      setLastSaved(new Date());
      return { ...prev, credit_cards: updated };
    });
  };

  const addCreditCard = () => {
    setFormData((prev) => {
      const list = Array.isArray(prev.credit_cards) ? prev.credit_cards : [];
      setLastSaved(new Date());
      return { ...prev, credit_cards: [...list, { amount_owing: '', description: '', monthly_payment: '' }] };
    });
  };

  const removeCreditCard = (index: number) => {
    setFormData((prev) => {
      const list = Array.isArray(prev.credit_cards) ? prev.credit_cards : [];
      if (list.length <= 1) return prev;
      setLastSaved(new Date());
      return { ...prev, credit_cards: list.filter((_, i) => i !== index) };
    });
  };

  // Parse number from form value (handles '', undefined, string, number)
  const toNum = (v: unknown): number => {
    if (v === '' || v === undefined || v === null) return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : n;
  };

  const computeAssetsTotal = (data: Record<string, unknown>): number => {
    return (
      toNum(data.investments_rrsp_amount) +
      toNum(data.chequing_amount) +
      toNum(data.savings_amount) +
      toNum(data.vehicles_estimated_value) +
      toNum(data.homes_estimated_value) +
      toNum(data.other_assets_estimated_value)
    );
  };

  const computeLiabilitiesTotalAmount = (data: Record<string, unknown>): number => {
    let sum =
      toNum(data.mortgage_amount_owing) +
      toNum(data.outstanding_loans_amount_owing) +
      toNum(data.personal_line_of_credit_amount_owing);
    const cards = data.credit_cards as Array<{ amount_owing?: unknown }> | undefined;
    if (Array.isArray(cards)) {
      cards.forEach((row) => {
        sum += toNum(row?.amount_owing);
      });
    }
    return sum;
  };

  const computeLiabilitiesTotalPayment = (data: Record<string, unknown>): number => {
    let sum =
      toNum(data.mortgage_monthly_payment) +
      toNum(data.outstanding_loans_monthly_payment) +
      toNum(data.personal_line_of_credit_monthly_payment);
    const cards = data.credit_cards as Array<{ monthly_payment?: unknown }> | undefined;
    if (Array.isArray(cards)) {
      cards.forEach((row) => {
        sum += toNum(row?.monthly_payment);
      });
    }
    return sum;
  };

  const computeMonthlyExpensesTotal = (data: Record<string, unknown>): number => {
    return (
      toNum(data.mortgage_payment_or_rent) +
      toNum(data.home_insurance) +
      toNum(data.property_taxes) +
      toNum(data.condo_fees) +
      toNum(data.utilities) +
      toNum(data.cable_satellite_tv_subscriptions) +
      toNum(data.telephone) +
      toNum(data.internet) +
      toNum(data.vehicle_maintenance_fuel_insurance) +
      toNum(data.groceries_food) +
      toNum(data.other_expenses)
    );
  };

  const formatTotal = (n: number): string => (n === 0 ? '' : String(n));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        assets_total: computeAssetsTotal(formData),
        liabilities_total_amount_owing: computeLiabilitiesTotalAmount(formData),
        liabilities_total_monthly_payment: computeLiabilitiesTotalPayment(formData),
        monthly_expenses_total: computeMonthlyExpensesTotal(formData),
      };
      const result = await onSubmit(payload);
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
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      return false;
    }
    
    // Map user-friendly application type labels to database values for comparison
    const applicationTypeMap: Record<string, string> = {
      'Preliminary Application for a small, short-term, Personal/Emergency loan': 'personal',
      'Preliminary Application for an Educational loan': 'education',
      'Preliminary Application for a Business or Institutional loan': 'business',
    };
    
    // For application_type field, handle both display labels and database values
    let normalizedFieldValue = fieldValue;
    let normalizedConditionValue = conditionValue;
    
    if (conditionField === 'application_type') {
      // Map display label to database value if needed
      if (applicationTypeMap[fieldValue as string]) {
        normalizedFieldValue = applicationTypeMap[fieldValue as string];
      }
      // Map condition value if it's a display label
      if (applicationTypeMap[conditionValue]) {
        normalizedConditionValue = applicationTypeMap[conditionValue];
      }
    }
    
    // For checkboxes, check if the value array includes the condition value
    if (Array.isArray(normalizedFieldValue)) {
      const isChecked = normalizedFieldValue.length > 0 && normalizedFieldValue.includes(normalizedConditionValue);
      return isChecked;
    }
    return normalizedFieldValue === normalizedConditionValue;
  };

  // Group fields by section
  const fieldsBySection = sections.reduce((acc, section) => {
    acc[section] = fields.filter((field) => field.section === section);
    return acc;
  }, {} as Record<string, FieldDefinition[]>);

  // Fields without a section (excluding testimony_pledge which is rendered separately)
  const fieldsWithoutSection = fields.filter((field) => !field.section && field.name !== 'testimony_pledge');
  
  // Get testimony pledge field if it exists
  const testimonyField = fields.find((field) => field.name === 'testimony_pledge');

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
  const renderField = (field: FieldDefinition, inTable: boolean = false, options?: { tooltip?: string }) => {
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
        inTable={inTable}
        rows={field.type === 'textarea' && field.section === '2. Loan Request' ? 2 : undefined}
        tooltip={options?.tooltip}
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
          : section === 'Reference Documents'
          ? "Before submitting your final loan application, please ensure that you have uploaded all required documents. Additional documents are required for business/institutional loans and educational loans as indicated below."
          : undefined;

        const isTableSection = section === 'Assets' || section === 'Total Liabilities' || section === 'Monthly Living Expenses' || section === 'Financial Status';

        return (
          <FormSection 
            key={`${section}-${section === 'Reference Documents' ? conditionalFieldsKey : ''}`} 
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
                      <div className={`grid grid-cols-1 ${isAssets ? 'md:grid-cols-3' : 'md:grid-cols-2'} divide-x divide-gray-300 bg-gray-100 border-b border-gray-300`}>
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
                        // Assets: 3 columns - Label | Amount (label + input on same line) | Type (label + input on same line)
                        renderedFields.push(
                          <div key={field.name} className="border-b border-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300">
                              <div className="p-4">
                                {field.rowLabel && (
                                  <label className="block text-sm font-medium">
                                    {field.rowLabel}
                                  </label>
                                )}
                              </div>
                              <div className="p-4 bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <label htmlFor={`field-${field.name}`} className="text-sm font-medium whitespace-nowrap">
                                    {field.label}
                                    {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  <div className="flex-1">
                                    {renderField(field, true)}
                                  </div>
                                </div>
                                {errors[field.name] && (
                                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                                )}
                              </div>
                              <div className="p-4 bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <label htmlFor={`field-${nextField.name}`} className="text-sm font-medium whitespace-nowrap">
                                    {nextField.label}
                                    {isFieldRequired(nextField) && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  <div className="flex-1">
                                    {renderField(nextField, true)}
                                  </div>
                                </div>
                                {errors[nextField.name] && (
                                  <p className="text-sm text-red-500 mt-1">{errors[nextField.name]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else if (section === 'Total Liabilities') {
                        // Total Liabilities: Single row with label + input on left, just input on right
                        renderedFields.push(
                          <div key={field.name} className="border-b border-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
                              {/* Left column: rowLabel + Amount owing input on same line */}
                              <div className="p-4 bg-gray-50">
                                <div className="flex items-center gap-2">
                                  {field.rowLabel && (
                                    <label className="text-sm font-medium whitespace-nowrap">
                                      {field.rowLabel}
                                    </label>
                                  )}
                                  <div className="flex-1">
                                    {renderField(field, true)}
                                  </div>
                                </div>
                                {errors[field.name] && (
                                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                                )}
                              </div>
                              {/* Right column: Just Monthly payment input (no label) */}
                              <div className="p-4 bg-gray-50">
                                {renderField(nextField, true)}
                                {errors[nextField.name] && (
                                  <p className="text-sm text-red-500 mt-1">{errors[nextField.name]}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Other sections: 2 columns
                        renderedFields.push(
                          <div key={field.name} className="border-b border-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
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
                      // Render single field (full width) - for Monthly Living Expenses and Financial Status
                      renderedFields.push(
                        <div key={field.name} className="border-b border-gray-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4 bg-gray-50">
                              <label className="block text-sm font-medium">
                                {field.label}
                                {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                              </label>
                            </div>
                            <div className="p-4">
                              {renderField(field, section === 'Financial Status' || section === 'Monthly Living Expenses')}
                            </div>
                          </div>
                        </div>
                      );
                      i += 1;
                    }
                  }
                  
                  // Credit cards: repeating rows (Total Liabilities only) – 3 columns: Amount owing | Description (optional) | Monthly payment
                  if (section === 'Total Liabilities') {
                    const creditCards = Array.isArray(formData.credit_cards) && formData.credit_cards.length > 0
                      ? formData.credit_cards
                      : [{ amount_owing: '', description: '', monthly_payment: '' }];
                    renderedFields.push(
                      <div key="credit-cards-block" className="border-b border-gray-300">
                        <div className="p-4 bg-gray-50 border-b border-gray-300">
                          <span className="text-sm font-medium">Credit Card(s):</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300 bg-gray-100 border-b border-gray-300">
                          <div className="p-3 font-semibold text-sm">Amount owing</div>
                          <div className="p-3 font-semibold text-sm">Description of the CC (optional)</div>
                          <div className="p-3 font-semibold text-sm">Monthly payment</div>
                        </div>
                        {creditCards.map((row, index) => (
                          <div key={`credit-card-${index}`} className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300 border-b border-gray-300">
                            <div className="p-4 bg-gray-50">
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={row.amount_owing === '' ? '' : row.amount_owing}
                                onChange={(e) => handleCreditCardChange(index, 'amount_owing', e.target.value === '' ? '' : e.target.value)}
                                className="bg-white border border-gray-300"
                              />
                            </div>
                            <div className="p-4 bg-gray-50">
                              <Input
                                type="text"
                                placeholder="e.g. Visa, Mastercard"
                                value={row.description ?? ''}
                                onChange={(e) => handleCreditCardChange(index, 'description', e.target.value)}
                                className="bg-white border border-gray-300"
                              />
                            </div>
                            <div className="p-4 bg-gray-50 flex items-center gap-2">
                              <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="0"
                                value={row.monthly_payment === '' ? '' : row.monthly_payment}
                                onChange={(e) => handleCreditCardChange(index, 'monthly_payment', e.target.value === '' ? '' : e.target.value)}
                                className="bg-white border border-gray-300 flex-1"
                              />
                              {creditCards.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCreditCard(index)}
                                  className="shrink-0"
                                  aria-label="Remove credit card"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="p-4 bg-gray-50">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCreditCard}
                          >
                            Add credit card
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  // Render total row(s)
                  if (totalFields.length > 0) {
                    if (section === 'Assets') {
                      // Assets total: calculated, read-only
                      const totalField = totalFields[0];
                      const assetsTotal = computeAssetsTotal(formData);
                      renderedFields.push(
                        <div key={totalField.name} className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300">
                            <div className="p-4">
                              {totalField.rowLabel && (
                                <label className="block text-sm font-semibold">
                                  {totalField.rowLabel}
                                </label>
                              )}
                            </div>
                            <div className="p-4 bg-gray-50">
                              <Input
                                type="text"
                                readOnly
                                value={formatTotal(assetsTotal)}
                                className="h-10 bg-white border border-gray-300 tabular-nums cursor-default"
                                tabIndex={-1}
                                aria-readonly
                              />
                            </div>
                            <div className="p-4"></div>
                          </div>
                        </div>
                      );
                    } else if (section === 'Total Liabilities') {
                      // Total Liabilities: calculated, read-only
                      const totalAmountField = totalFields.find(f => f.name.includes('amount_owing'));
                      const totalPaymentField = totalFields.find(f => f.name.includes('monthly_payment'));
                      const liabilitiesAmount = computeLiabilitiesTotalAmount(formData);
                      const liabilitiesPayment = computeLiabilitiesTotalPayment(formData);
                      renderedFields.push(
                        <div key="liabilities-total" className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4 bg-gray-50">
                              {totalAmountField?.rowLabel && (
                                <div className="flex items-center gap-2">
                                  <label className="text-sm font-semibold whitespace-nowrap">
                                    {totalAmountField.rowLabel}
                                  </label>
                                  <Input
                                    type="text"
                                    readOnly
                                    value={formatTotal(liabilitiesAmount)}
                                    className="h-10 flex-1 bg-white border border-gray-300 tabular-nums cursor-default"
                                    tabIndex={-1}
                                    aria-readonly
                                  />
                                </div>
                              )}
                            </div>
                            <div className="p-4 bg-gray-50">
                              <Input
                                type="text"
                                readOnly
                                value={formatTotal(liabilitiesPayment)}
                                className="h-10 bg-white border border-gray-300 tabular-nums cursor-default"
                                tabIndex={-1}
                                aria-readonly
                              />
                            </div>
                          </div>
                        </div>
                      );
                    } else if (section === 'Monthly Living Expenses') {
                      // Monthly Living Expenses total: calculated, read-only
                      const totalField = totalFields[0];
                      const expensesTotal = computeMonthlyExpensesTotal(formData);
                      renderedFields.push(
                        <div key={totalField.name} className="border-t-2 border-gray-400 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
                            <div className="p-4">
                              <label className="block text-sm font-semibold">
                                {totalField.label}
                              </label>
                            </div>
                            <div className="p-4 bg-gray-50">
                              <Input
                                type="text"
                                readOnly
                                value={formatTotal(expensesTotal)}
                                className="h-10 bg-white border border-gray-300 tabular-nums cursor-default"
                                tabIndex={-1}
                                aria-readonly
                              />
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
                  const sectionNotes: string[] = [];
                  let i = 0;
                  
                  while (i < sectionFields.length) {
                    const field = sectionFields[i];
                    
                    // Skip field if it shouldn't be shown
                    if (!shouldShowField(field)) {
                      i += 1;
                      continue;
                    }
                    
                    // Handle quarter width (4 fields per row, or quarter + quarter + half)
                    if (field.width === 'quarter') {
                      const nextField = sectionFields[i + 1];
                      const thirdField = sectionFields[i + 2];
                      const nextIsQuarter = nextField?.width === 'quarter';
                      const thirdIsHalf = thirdField?.width === 'half';
                      
                      // Handle quarter + quarter when third is half (phone + cell only; email+sin rendered as half+half)
                      if (nextIsQuarter && thirdIsHalf && nextField && shouldShowField(nextField)) {
                        renderedFields.push(
                          <div key={`quarter-quarter-${i}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {renderField(field)}
                              {renderField(nextField)}
                            </div>
                          </div>
                        );
                        i += 2;
                        continue;
                      }
                      
                      // Handle regular quarter grouping (up to 4 fields)
                      const quarterFields: FieldDefinition[] = [field];
                      let j = i + 1;
                      while (j < sectionFields.length && quarterFields.length < 4) {
                        const nextField = sectionFields[j];
                        if (nextField?.width === 'quarter' && shouldShowField(nextField)) {
                          quarterFields.push(nextField);
                          j++;
                        } else {
                          break;
                        }
                      }
                      
                      renderedFields.push(
                        <div key={`quarter-${i}`}>
                          {field.note && section !== '1. Personal Information' && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                              <AlertDescription className="font-medium text-sm">
                                {field.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    return (
                                      <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                        {linkMatch[1]}
                                      </Link>
                                    );
                                  }
                                  return <span key={idx}>{part}</span>;
                                })}
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {quarterFields.map((f) => (
                              <div key={f.name}>{renderField(f)}</div>
                            ))}
                          </div>
                        </div>
                      );
                      i += quarterFields.length;
                      continue;
                    }
                    
                    // Handle third width (3 fields per row)
                    if (field.width === 'third') {
                      const thirdFields: FieldDefinition[] = [field];
                      let j = i + 1;
                      while (j < sectionFields.length && thirdFields.length < 3) {
                        const nextField = sectionFields[j];
                        if (nextField?.width === 'third' && shouldShowField(nextField)) {
                          thirdFields.push(nextField);
                          j++;
                        } else {
                          break;
                        }
                      }
                      
                      renderedFields.push(
                        <div key={`third-${i}`}>
                          {field.note && section !== '1. Personal Information' && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                              <AlertDescription className="font-medium text-sm">
                                {field.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    return (
                                      <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                        {linkMatch[1]}
                                      </Link>
                                    );
                                  }
                                  return <span key={idx}>{part}</span>;
                                })}
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {thirdFields.map((f) => (
                              <div key={f.name}>{renderField(f)}</div>
                            ))}
                          </div>
                        </div>
                      );
                      i += thirdFields.length;
                      continue;
                    }
                    
                    // Handle half width (2 fields per row, or half + quarters)
                    const nextField = sectionFields[i + 1];
                    const isHalfWidth = field.width === 'half';
                    const nextIsHalfWidth = nextField?.width === 'half';
                    const nextIsQuarter = nextField?.width === 'quarter';
                    
                    // Handle half + quarter + quarter (address + city + province)
                    if (isHalfWidth && nextIsQuarter && nextField && shouldShowField(nextField)) {
                      const thirdField = sectionFields[i + 2];
                      const thirdIsQuarter = thirdField?.width === 'quarter';
                      
                      if (thirdIsQuarter && thirdField && shouldShowField(thirdField)) {
                        renderedFields.push(
                          <div key={`half-quarter-quarter-${i}`}>
                            {field.note && (
                              <Alert className="mb-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                                <AlertDescription className="font-medium text-sm">
                                  {field.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                    if (linkMatch) {
                                      return (
                                        <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                          {linkMatch[1]}
                                        </Link>
                                      );
                                    }
                                    return <span key={idx}>{part}</span>;
                                  })}
                                </AlertDescription>
                              </Alert>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-2">{renderField(field)}</div>
                              {renderField(nextField)}
                              {renderField(thirdField)}
                            </div>
                            {(nextField.note || thirdField.note) && (
                              <Alert className="mt-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                                <AlertDescription className="font-medium text-sm">
                                  {(nextField.note || thirdField.note)?.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                    if (linkMatch) {
                                      return (
                                        <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                          {linkMatch[1]}
                                        </Link>
                                      );
                                    }
                                    return <span key={idx}>{part}</span>;
                                  })}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        );
                        i += 3;
                        continue;
                      }
                    }
                    
                    if (isHalfWidth && nextIsHalfWidth && nextField && shouldShowField(nextField)) {
                      // Email + SIN row: show email note below the email field
                      const isEmailSinRow = field.name === 'email' && nextField.name === 'sin';
                      renderedFields.push(
                        <div key={field.name}>
                          {!isEmailSinRow && field.note && section !== '1. Personal Information' && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                              <AlertDescription className="font-medium text-sm">
                                {field.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    return (
                                      <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                        {linkMatch[1]}
                                      </Link>
                                    );
                                  }
                                  return <span key={idx}>{part}</span>;
                                })}
                              </AlertDescription>
                            </Alert>
                          )}
                          {field.rowLabel && (
                            <label className="block text-sm font-medium mb-2">
                              {field.rowLabel}
                            </label>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              {renderField(field, false, { tooltip: isEmailSinRow ? field.note : undefined })}
                            </div>
                            <div>{renderField(nextField)}</div>
                          </div>
                          {!isEmailSinRow && nextField.note && section !== '1. Personal Information' && (
                            <Alert className="mt-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                              <AlertDescription className="font-medium text-sm">
                                {nextField.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    return (
                                      <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                        {linkMatch[1]}
                                      </Link>
                                    );
                                  }
                                  return <span key={idx}>{part}</span>;
                                })}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      );
                      i += 2;
                    } else {
                      // Render single field (full width)
                      renderedFields.push(
                        <div key={field.name}>
                          {field.note && section !== '1. Personal Information' && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                              <AlertDescription className="font-medium text-sm">
                                {field.note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                                  if (linkMatch) {
                                    return (
                                      <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                        {linkMatch[1]}
                                      </Link>
                                    );
                                  }
                                  return <span key={idx}>{part}</span>;
                                })}
                              </AlertDescription>
                            </Alert>
                          )}
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
                  
                  // Collect notes from all fields in Personal Information section (only for preliminary)
                  // For final application "Personal Information", notes show inline above fields
                  if (section === '1. Personal Information') {
                    sectionFields.forEach((field) => {
                      if (shouldShowField(field) && field.note && !sectionNotes.includes(field.note)) {
                        sectionNotes.push(field.note);
                      }
                    });
                  }
                  
                  // Render notes at the bottom of Personal Information section (only for preliminary)
                  if (section === '1. Personal Information' && sectionNotes.length > 0) {
                    sectionNotes.forEach((note, noteIdx) => {
                      renderedFields.push(
                        <Alert key={`section-note-${noteIdx}`} className="mt-4 bg-blue-50 border-blue-200 border-2 dark:bg-blue-950 dark:border-blue-800">
                          <AlertDescription className="font-medium text-sm">
                            {note.split(/(\[.*?\]\(.*?\))/g).map((part, idx) => {
                              const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                              if (linkMatch) {
                                return (
                                  <Link key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-semibold">
                                    {linkMatch[1]}
                                  </Link>
                                );
                              }
                              return <span key={idx}>{part}</span>;
                            })}
                          </AlertDescription>
                        </Alert>
                      );
                    });
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

      {testimonyField && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={`field-${testimonyField.name}`}
              checked={Array.isArray(formData[testimonyField.name]) && formData[testimonyField.name].includes('I agree')}
              onCheckedChange={(checked) => {
                handleFieldChange(testimonyField.name, checked ? ['I agree'] : []);
              }}
              required={isFieldRequired(testimonyField)}
              className="mt-1"
            />
            <Label
              htmlFor={`field-${testimonyField.name}`}
              className="text-sm font-normal cursor-pointer flex-1 leading-relaxed"
            >
              {testimonyField.label}
              {isFieldRequired(testimonyField) && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
          {errors[testimonyField.name] && (
            <p className="text-sm text-red-500 mt-2 ml-7">{errors[testimonyField.name]}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <AutoSaveIndicator lastSaved={lastSaved} />
        <FormSubmitButton isSubmitting={isSubmitting} />
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Thank you for submitting your application. Our team will review it carefully and respond to you as soon as possible, insha&apos;Allah.</p>
      </div>
    </form>
  );
}


