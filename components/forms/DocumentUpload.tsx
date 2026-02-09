'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentUploadProps {
  name: string;
  label: string;
  required?: boolean;
  value?: string; // URL of uploaded file
  onChange: (url: string | null) => void;
  error?: string;
  accept?: string;
}

export function DocumentUpload({
  name,
  label,
  required = false,
  value,
  onChange,
  error,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setFileName(file.name);

    try {
      // Create FormData for the file
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to our API which handles Vercel Blob upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const { url } = await response.json();
      onChange(url);
      setUploadError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setFileName(null);
      onChange(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setFileName(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {value ? (
        <div className="flex items-center justify-between p-3 border border-green-300 bg-green-50 rounded-md">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-green-600" />
            <span className="text-sm text-green-800">
              {fileName || 'File uploaded successfully'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            id={name}
            name={name}
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor={name}
            className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
              error || uploadError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full size-4 border-b-2 border-gray-900"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="size-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {(error || uploadError) && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="size-4" />
          <span>{error || uploadError}</span>
        </div>
      )}

      {!value && !uploading && (
        <p className="text-xs text-gray-500">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
        </p>
      )}
    </div>
  );
}

