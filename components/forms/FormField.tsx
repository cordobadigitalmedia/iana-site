'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormFieldProps {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'number' | 'email' | 'tel';
  required?: boolean;
  value?: string | number | string[];
  onChange: (value: string | string[]) => void;
  onBlur?: () => void;
  error?: string;
  options?: string[];
  placeholder?: string;
  inTable?: boolean;
  rows?: number;
}

export function FormField({
  name,
  label,
  type,
  required = false,
  value = '',
  onChange,
  onBlur,
  error,
  options,
  placeholder,
  inTable = false,
  rows,
}: FormFieldProps) {
  const fieldId = `field-${name}`;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${error ? 'border-red-500' : ''} ${rows === 2 ? '!min-h-0' : ''}`}
            style={rows === 2 ? { minHeight: 'auto' } : undefined}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={onChange}
            required={required}
          >
            <SelectTrigger
              id={fieldId}
              className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
            >
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            id={fieldId}
            name={name}
            type="number"
            value={value as number}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
          />
        );
      case 'date':
        return (
          <Input
            id={fieldId}
            name={name}
            type="date"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            required={required}
            className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
          />
        );
      case 'email':
        return (
          <Input
            id={fieldId}
            name={name}
            type="email"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
          />
        );
      case 'tel':
        return (
          <Input
            id={fieldId}
            name={name}
            type="tel"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
          />
        );
      case 'checkbox':
        if (!options || options.length === 0) {
          return null;
        }
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {options.map((option) => {
              const optionId = `${fieldId}-${option}`;
              const isChecked = checkboxValues.includes(option);
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={optionId}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newValues = checked
                        ? [...checkboxValues, option]
                        : checkboxValues.filter((v) => v !== option);
                      onChange(newValues);
                    }}
                  />
                  <Label
                    htmlFor={optionId}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        );
      case 'radio':
        if (!options || options.length === 0) {
          return null;
        }
        return (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            required={required}
            className="flex flex-wrap gap-4"
          >
            {options.map((option) => {
              const optionId = `${fieldId}-${option}`;
              return (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={optionId} />
                  <Label
                    htmlFor={optionId}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );
      default:
        return (
          <Input
            id={fieldId}
            name={name}
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            className={error ? 'border-red-500' : inTable ? 'bg-white' : ''}
          />
        );
    }
  };

  // For radio buttons, put label and field on same line
  if (type === 'radio' && !inTable) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Label htmlFor={fieldId} className="whitespace-nowrap">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {renderField()}
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!inTable && (
        <Label htmlFor={fieldId}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}


