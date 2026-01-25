import { z } from 'zod';
import fieldDefinitions from './preliminary-unified-fields.json';

// Build Zod schema from field definitions
function buildSchemaFromFields(fields: typeof fieldDefinitions.fields) {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'email':
        fieldSchema = z.string().email('Please enter a valid email address');
        break;
      case 'tel':
        fieldSchema = z.string().min(1, 'Phone number is required');
        break;
      case 'date':
        fieldSchema = z.string().min(1, 'Date is required');
        break;
      case 'number':
        fieldSchema = z.coerce.number().positive('Must be a positive number');
        break;
      case 'textarea':
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
      case 'checkbox':
        fieldSchema = field.required
          ? z.array(z.string()).min(1, `${field.label} is required`)
          : z.array(z.string()).optional();
        break;
      case 'radio':
      case 'select':
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
      case 'text':
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
    }

    // Make fields optional if they're not required OR if they have conditionalShow
    // (conditional fields will be validated in superRefine based on application_type)
    if ((!field.required || field.conditionalShow) && field.type !== 'checkbox') {
      fieldSchema = fieldSchema.optional();
    }

    schemaObject[field.name] = fieldSchema;
  }

  return z.object(schemaObject);
}

// Create base schema
const baseSchema = buildSchemaFromFields(fieldDefinitions.fields);

// Map user-friendly labels to database values
const applicationTypeMap: Record<string, string> = {
  'Preliminary Application for a small, short-term, Personal/Emergency loan': 'personal',
  'Preliminary Application for an Educational loan via Iana': 'education',
  'Preliminary Application for a Business or Institutional loan via Iana Independence or Iana Community': 'business',
};

// Create refined schema that validates conditionally based on application_type
export const preliminaryUnifiedSchema = baseSchema.superRefine((data, ctx) => {
  // Map display label to database value
  let applicationType = data.application_type;
  if (applicationType && applicationTypeMap[applicationType]) {
    applicationType = applicationTypeMap[applicationType];
    // Update the data object with the mapped value for storage
    (data as any).application_type = applicationType;
  }
  
  // Validate required fields based on application type (using database values)
  if (applicationType === 'personal') {
    // Personal-specific required fields
    const personalFields = [
      { name: 'loan_required_reason', label: 'Why is this loan required?' },
      { name: 'underlying_circumstances', label: 'What do you feel are the underlying circumstances for your situation?' },
      { name: 'avoid_similar_situation', label: 'How do you plan to avoid a similar situation in future?' },
      { name: 'unable_to_meet_repayment', label: 'What would you do if you were unable to meet the terms of your repayment plan?' },
    ];
    
    personalFields.forEach(({ name, label }) => {
      if (!data[name as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required`,
          path: [name],
        });
      }
    });
  } else if (applicationType === 'education') {
    // Education-specific required fields
    const educationFields = [
      { name: 'current_or_planned_institution', label: 'Current or Planned Institution' },
      { name: 'area_of_study', label: 'Area of Study' },
      { name: 'date_of_graduation', label: 'Date of Graduation' },
      { name: 'current_student_loan_amount', label: 'Current Student Loan Amount' },
      { name: 'student_loans_expected_upon_graduation', label: 'Amount of Student Loans Expected upon Graduation' },
      { name: 'loan_purpose', label: 'What is the purpose of this loan?' },
      { name: 'how_loan_will_benefit_you', label: 'How will this loan benefit you?' },
      { name: 'loan_will_benefit_others', label: 'Will this loan benefit others?' },
      { name: 'why_not_conventional_student_loans', label: 'Why have you chosen not to use conventional student loans?' },
      { name: 'unable_to_meet_repayment_education', label: 'What would you do if you were unable to meet the terms of your repayment plan?' },
      { name: 'decide_to_pursue_program', label: 'How and why did you decide to pursue this program of study?' },
      { name: 'ethical_challenges_field_of_study', label: 'Every field of study poses ethical challenges...' },
      { name: 'vision_for_accomplishment', label: 'What is your vision for what you will accomplish through your field of study?' },
      { name: 'books_enjoy_reading', label: 'What types of books do you enjoy reading?' },
    ];
    
    educationFields.forEach(({ name, label }) => {
      if (!data[name as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required`,
          path: [name],
        });
      }
    });
  } else if (applicationType === 'business') {
    // Business-specific required fields
    const businessFields = [
      { name: 'loan_purpose_business', label: 'What is the purpose of this loan?' },
      { name: 'how_loan_will_benefit_you_business', label: 'How will this loan benefit you?' },
      { name: 'loan_will_benefit_others_business', label: 'Will this loan benefit others?' },
      { name: 'decide_to_pursue_initiative', label: 'How and why did you decide to pursue this initiative?' },
      { name: 'business_project_plan', label: 'Do you have a business/project plan that you would be willing to share with IANA?' },
    ];
    
    businessFields.forEach(({ name, label }) => {
      if (!data[name as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required`,
          path: [name],
        });
      }
    });
  }
});

export type PreliminaryUnifiedFormData = z.infer<typeof preliminaryUnifiedSchema>;
