/**
 * Returns field names in the order they appear in the user-facing form,
 * for a given application type. Used by admin form data view.
 */
import finalFields from './schemas/final-application-fields.json';
import preliminaryPersonalFields from './schemas/preliminary-personal-fields.json';
import preliminaryBusinessFields from './schemas/preliminary-business-fields.json';
import preliminaryEducationFields from './schemas/preliminary-education-fields.json';
import preliminaryUnifiedFields from './schemas/preliminary-unified-fields.json';

const fieldDefs: Record<string, { fields: Array<{ name: string }> }> = {
  final: finalFields as { fields: Array<{ name: string }> },
  'preliminary-personal': preliminaryPersonalFields as { fields: Array<{ name: string }> },
  'preliminary-business': preliminaryBusinessFields as { fields: Array<{ name: string }> },
  'preliminary-education': preliminaryEducationFields as { fields: Array<{ name: string }> },
  preliminary: preliminaryUnifiedFields as { fields: Array<{ name: string }> },
};

export function getOrderedFieldNames(applicationType: string): string[] {
  const def = fieldDefs[applicationType] ?? fieldDefs.preliminary;
  if (!def?.fields || !Array.isArray(def.fields)) return [];
  return def.fields.map((f) => f.name);
}
