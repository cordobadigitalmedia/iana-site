'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface VolunteerEntry {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  duties: string;
}

interface VolunteerSectionProps {
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export function VolunteerSection({ formData, onChange, errors }: VolunteerSectionProps) {
  const [entries, setEntries] = useState<VolunteerEntry[]>([
    { role: '', organization: '', startDate: '', endDate: '', duties: '' }
  ]);

  const maxEntries = 5;

  // Initialize from formData on mount
  useEffect(() => {
    const volunteerEntries: VolunteerEntry[] = [];
    let index = 1;
    
    while (index <= maxEntries) {
      const role = formData[`volunteer_role_${index}`] || '';
      const organization = formData[`volunteer_organization_${index}`] || '';
      const startDate = formData[`volunteer_start_date_${index}`] || '';
      const endDate = formData[`volunteer_end_date_${index}`] || '';
      const duties = formData[`volunteer_duties_${index}`] || '';
      
      // Only add entry if at least one field has a value, or if it's the first entry
      if (index === 1 || role || organization || startDate || endDate || duties) {
        volunteerEntries.push({ role, organization, startDate, endDate, duties });
      } else {
        break;
      }
      index++;
    }
    
    // Ensure at least 1 entry
    if (volunteerEntries.length === 0) {
      volunteerEntries.push({ role: '', organization: '', startDate: '', endDate: '', duties: '' });
    }
    
    setEntries(volunteerEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const updateEntry = (index: number, field: keyof VolunteerEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
    
    // Update formData
    const updatedData = { ...formData };
    updatedData[`volunteer_role_${index + 1}`] = newEntries[index].role;
    updatedData[`volunteer_organization_${index + 1}`] = newEntries[index].organization;
    updatedData[`volunteer_start_date_${index + 1}`] = newEntries[index].startDate;
    updatedData[`volunteer_end_date_${index + 1}`] = newEntries[index].endDate;
    updatedData[`volunteer_duties_${index + 1}`] = newEntries[index].duties;
    
    // Clear any entries beyond the current length
    for (let i = entries.length + 1; i <= maxEntries; i++) {
      delete updatedData[`volunteer_role_${i}`];
      delete updatedData[`volunteer_organization_${i}`];
      delete updatedData[`volunteer_start_date_${i}`];
      delete updatedData[`volunteer_end_date_${i}`];
      delete updatedData[`volunteer_duties_${i}`];
    }
    
    onChange(updatedData);
  };

  const addEntry = () => {
    if (entries.length < maxEntries) {
      const newEntries = [...entries, { role: '', organization: '', startDate: '', endDate: '', duties: '' }];
      setEntries(newEntries);
    }
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
      
      // Update formData and clear removed entry
      const updatedData = { ...formData };
      
      // Shift entries down
      for (let i = index; i < entries.length - 1; i++) {
        updatedData[`volunteer_role_${i + 1}`] = newEntries[i].role;
        updatedData[`volunteer_organization_${i + 1}`] = newEntries[i].organization;
        updatedData[`volunteer_start_date_${i + 1}`] = newEntries[i].startDate;
        updatedData[`volunteer_end_date_${i + 1}`] = newEntries[i].endDate;
        updatedData[`volunteer_duties_${i + 1}`] = newEntries[i].duties;
      }
      
      // Clear the last entry
      const lastIndex = entries.length;
      delete updatedData[`volunteer_role_${lastIndex}`];
      delete updatedData[`volunteer_organization_${lastIndex}`];
      delete updatedData[`volunteer_start_date_${lastIndex}`];
      delete updatedData[`volunteer_end_date_${lastIndex}`];
      delete updatedData[`volunteer_duties_${lastIndex}`];
      
      onChange(updatedData);
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-md p-4 space-y-4"
        >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Volunteer Role {index + 1}
              </h4>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Remove volunteer role"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor={`volunteer_role_${index + 1}`}>
                Volunteer role:
              </Label>
              <Input
                id={`volunteer_role_${index + 1}`}
                name={`volunteer_role_${index + 1}`}
                type="text"
                value={entry.role}
                onChange={(e) => updateEntry(index, 'role', e.target.value)}
                className={errors?.[`volunteer_role_${index + 1}`] ? 'border-red-500' : ''}
              />
              {errors?.[`volunteer_role_${index + 1}`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`volunteer_role_${index + 1}`]}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor={`volunteer_organization_${index + 1}`}>
                Organization:
              </Label>
              <Input
                id={`volunteer_organization_${index + 1}`}
                name={`volunteer_organization_${index + 1}`}
                type="text"
                value={entry.organization}
                onChange={(e) => updateEntry(index, 'organization', e.target.value)}
                className={errors?.[`volunteer_organization_${index + 1}`] ? 'border-red-500' : ''}
              />
              {errors?.[`volunteer_organization_${index + 1}`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`volunteer_organization_${index + 1}`]}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`volunteer_start_date_${index + 1}`}>
                  Position start date:
                </Label>
                <Input
                  id={`volunteer_start_date_${index + 1}`}
                  name={`volunteer_start_date_${index + 1}`}
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => updateEntry(index, 'startDate', e.target.value)}
                  className={errors?.[`volunteer_start_date_${index + 1}`] ? 'border-red-500' : ''}
                />
                {errors?.[`volunteer_start_date_${index + 1}`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`volunteer_start_date_${index + 1}`]}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor={`volunteer_end_date_${index + 1}`}>
                  Position end date:
                </Label>
                <Input
                  id={`volunteer_end_date_${index + 1}`}
                  name={`volunteer_end_date_${index + 1}`}
                  type="date"
                  value={entry.endDate}
                  onChange={(e) => updateEntry(index, 'endDate', e.target.value)}
                  className={errors?.[`volunteer_end_date_${index + 1}`] ? 'border-red-500' : ''}
                />
                {errors?.[`volunteer_end_date_${index + 1}`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`volunteer_end_date_${index + 1}`]}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor={`volunteer_duties_${index + 1}`}>
                Duties and achievements:
              </Label>
              <Textarea
                id={`volunteer_duties_${index + 1}`}
                name={`volunteer_duties_${index + 1}`}
                value={entry.duties}
                onChange={(e) => updateEntry(index, 'duties', e.target.value)}
                rows={4}
                className={errors?.[`volunteer_duties_${index + 1}`] ? 'border-red-500' : ''}
              />
              {errors?.[`volunteer_duties_${index + 1}`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`volunteer_duties_${index + 1}`]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {entries.length < maxEntries && (
        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Volunteer Role
        </Button>
      )}
    </div>
  );
}

