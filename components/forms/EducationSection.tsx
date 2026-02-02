'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EducationEntry {
  institution: string;
  program: string;
  year: string;
}

interface EducationSectionProps {
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  errors?: Record<string, string>;
}

export function EducationSection({ formData, onChange, errors }: EducationSectionProps) {
  const [entries, setEntries] = useState<EducationEntry[]>([
    { institution: '', program: '', year: '' }
  ]);

  const maxEntries = 5;

  // Initialize from formData on mount
  useEffect(() => {
    const educationEntries: EducationEntry[] = [];
    let index = 1;
    
    while (index <= maxEntries) {
      const institution = formData[`education_institution_${index}`] || '';
      const program = formData[`education_program_${index}`] || '';
      const year = formData[`education_year_${index}`] || '';
      
      // Only add entry if at least one field has a value, or if it's the first entry
      if (index === 1 || institution || program || year) {
        educationEntries.push({ institution, program, year });
      } else {
        break;
      }
      index++;
    }
    
    // Ensure at least one entry
    if (educationEntries.length === 0) {
      educationEntries.push({ institution: '', program: '', year: '' });
    }
    
    setEntries(educationEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const updateEntry = (index: number, field: keyof EducationEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
    
    // Update formData
    const updatedData = { ...formData };
    updatedData[`education_institution_${index + 1}`] = newEntries[index].institution;
    updatedData[`education_program_${index + 1}`] = newEntries[index].program;
    updatedData[`education_year_${index + 1}`] = newEntries[index].year;
    
    // Clear any entries beyond the current length
    for (let i = entries.length + 1; i <= maxEntries; i++) {
      delete updatedData[`education_institution_${i}`];
      delete updatedData[`education_program_${i}`];
      delete updatedData[`education_year_${i}`];
    }
    
    onChange(updatedData);
  };

  const addEntry = () => {
    if (entries.length < maxEntries) {
      const newEntries = [...entries, { institution: '', program: '', year: '' }];
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
        updatedData[`education_institution_${i + 1}`] = newEntries[i].institution;
        updatedData[`education_program_${i + 1}`] = newEntries[i].program;
        updatedData[`education_year_${i + 1}`] = newEntries[i].year;
      }
      
      // Clear the last entry
      const lastIndex = entries.length;
      delete updatedData[`education_institution_${lastIndex}`];
      delete updatedData[`education_program_${lastIndex}`];
      delete updatedData[`education_year_${lastIndex}`];
      
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
              Institution {index + 1}
            </h4>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(index)}
                className="text-red-600 hover:text-red-800"
                aria-label="Remove institution"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor={`education_institution_${index + 1}`}>
                Institution:
              </Label>
              <Input
                id={`education_institution_${index + 1}`}
                name={`education_institution_${index + 1}`}
                type="text"
                value={entry.institution}
                onChange={(e) => updateEntry(index, 'institution', e.target.value)}
                className={errors?.[`education_institution_${index + 1}`] ? 'border-red-500' : ''}
              />
              {errors?.[`education_institution_${index + 1}`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`education_institution_${index + 1}`]}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`education_program_${index + 1}`}>
                  Program:
                </Label>
                <Input
                  id={`education_program_${index + 1}`}
                  name={`education_program_${index + 1}`}
                  type="text"
                  value={entry.program}
                  onChange={(e) => updateEntry(index, 'program', e.target.value)}
                  className={errors?.[`education_program_${index + 1}`] ? 'border-red-500' : ''}
                />
                {errors?.[`education_program_${index + 1}`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`education_program_${index + 1}`]}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor={`education_year_${index + 1}`}>
                  Year:
                </Label>
                <Input
                  id={`education_year_${index + 1}`}
                  name={`education_year_${index + 1}`}
                  type="text"
                  value={entry.year}
                  onChange={(e) => updateEntry(index, 'year', e.target.value)}
                  className={errors?.[`education_year_${index + 1}`] ? 'border-red-500' : ''}
                />
                {errors?.[`education_year_${index + 1}`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`education_year_${index + 1}`]}
                  </p>
                )}
              </div>
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
          Add Another Institution
        </Button>
      )}
    </div>
  );
}

