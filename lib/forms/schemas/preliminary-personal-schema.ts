import { z } from 'zod';
import fieldDefinitions from './preliminary-personal-fields.json';

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
        fieldSchema = z.string().min(1, `${field.label} is required`);
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

  return z.object(schemaObject);
}

export const preliminaryPersonalSchema = buildSchemaFromFields(fieldDefinitions.fields);

export type PreliminaryPersonalFormData = z.infer<typeof preliminaryPersonalSchema>;


