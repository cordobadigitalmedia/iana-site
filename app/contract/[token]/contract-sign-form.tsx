'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { submitSignedContract } from './actions';
import { AlertCircle, Download, Upload, Check } from 'lucide-react';

type Props = {
  token: string;
  contractContent: string;
};

export function ContractSignForm({ token, contractContent }: Props) {
  const router = useRouter();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitPending, setSubmitPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File must be less than 10MB');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const { url } = await res.json();
      setSignedUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setSignedUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedUrl) {
      setSubmitError('Please upload your signed contract first.');
      return;
    }
    setSubmitError(null);
    setSubmitPending(true);
    try {
      const result = await submitSignedContract(token, signedUrl);
      if (result?.error) {
        setSubmitError(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setSubmitPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-muted/30 p-6 print:p-0 print:border-0 print:bg-transparent">
        <h2 className="text-lg font-semibold mb-2 print:mb-4">Loan agreement</h2>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed print:text-black">
          {contractContent}
        </pre>
      </section>

      <div className="print:hidden space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Review contract</h2>
          <p className="text-muted-foreground text-sm mb-2">
            Read the contract above. Use the button below to print or save as PDF.
          </p>
          <Button type="button" variant="outline" onClick={handlePrint}>
            <Download className="mr-2 size-4" />
            Print / Save as PDF
          </Button>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Download PDF and sign</h2>
          <p className="text-muted-foreground text-sm">
            After saving as PDF, sign the contract. Then upload the signed PDF below.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">3. Upload signed contract and submit</h2>
            <p className="text-muted-foreground text-sm mb-3">
              Upload the signed contract (PDF). Accepted: PDF, DOC, DOCX, JPG, PNG (max 10MB).
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="sr-only"
                />
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Upload className="mr-2 size-4" />
                    {uploading ? 'Uploading…' : 'Choose file'}
                  </span>
                </Button>
              </label>
              {signedUrl && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="size-4" />
                  File uploaded
                </span>
              )}
            </div>
            {uploadError && (
              <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                <AlertCircle className="size-4" />
                {uploadError}
              </p>
            )}
          </section>

          {submitError && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="size-4" />
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={!signedUrl || submitPending}>
            {submitPending ? 'Submitting…' : 'Submit signed contract'}
          </Button>
        </form>
      </div>
    </div>
  );
}
