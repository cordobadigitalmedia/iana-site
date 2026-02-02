import { z } from 'zod';
import fieldDefinitions from './final-application-fields.json';

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
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
      case 'file':
        fieldSchema = z.string().url('Please upload a valid file');
        break;
      case 'text':
      default:
        fieldSchema = z.string().min(1, `${field.label} is required`);
        break;
    }

    if (!field.required && field.type !== 'checkbox') {
      fieldSchema = fieldSchema.optional();
    }

    schemaObject[field.name] = fieldSchema;
  }

  // Credit cards: repeating rows with amount, description (optional), monthly payment
  const creditCardRowSchema = z.object({
    amount_owing: z.union([z.coerce.number(), z.literal('')]).optional(),
    description: z.string().optional(),
    monthly_payment: z.union([z.coerce.number(), z.literal('')]).optional(),
  });
  schemaObject.credit_cards = z.array(creditCardRowSchema).default([]).optional();

  // Create base schema
  const baseSchema = z.object(schemaObject);

  // Add conditional validation for required documents
  return baseSchema.refine((data) => {
    for (const field of fields) {
      if (field.type === 'file') {
        // Skip validation if field shouldn't be shown
        if (field.conditionalShow) {
          const { field: conditionField, value: conditionValue } = field.conditionalShow;
          const fieldValue = data[conditionField];
          const shouldShow = Array.isArray(fieldValue) 
            ? fieldValue.includes(conditionValue)
            : fieldValue === conditionValue;
          if (!shouldShow) continue;
        }
        
        // Check if field is required
        if (field.required && !data[field.name]) {
          return false;
        }
        // Check conditional requirements
        if (field.conditionalRequired) {
          const { field: conditionField, value: conditionValue } = field.conditionalRequired;
          const fieldValue = data[conditionField];
          const conditionMet = Array.isArray(fieldValue)
            ? fieldValue.includes(conditionValue)
            : fieldValue === conditionValue;
          if (conditionMet && !data[field.name]) {
            return false;
          }
        }
      }
    }
    return true;
  }, {
    message: 'Please upload all required documents',
  });
}

export const finalApplicationSchema = buildSchemaFromFields(fieldDefinitions.fields);

export type FinalApplicationFormData = z.infer<typeof finalApplicationSchema>;


