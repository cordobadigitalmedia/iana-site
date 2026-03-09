'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

type Props = {
  label: string;
  url: string;
  className?: string;
  children?: React.ReactNode;
};

function getPreviewType(url: string): 'pdf' | 'image' | 'other' {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.pdf')) return 'pdf';
    if (/\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(pathname)) return 'image';
  } catch {
    // ignore
  }
  return 'other';
}

export function DocumentPreviewLink({ label, url, className, children }: Props) {
  const [open, setOpen] = useState(false);
  const type = getPreviewType(url);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? 'text-primary hover:underline text-left'}
      >
        {children ?? `${label} (preview)`}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col">
          <DialogTitle className="sr-only">{label}</DialogTitle>
          <div className="flex items-center justify-between gap-2 pb-2 border-b">
            <span className="font-medium truncate">{label}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <ExternalLink className="size-4" />
              Open in new tab
            </a>
          </div>
          <div className="min-h-0 flex-1 overflow-auto rounded border bg-muted/30 flex items-center justify-center">
            {type === 'pdf' && (
              <iframe
                src={url}
                title={label}
                className="w-full h-[70vh] min-h-[400px] rounded"
              />
            )}
            {type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element -- dynamic upload URL (Vercel Blob, etc.)
              <img
                src={url}
                alt={label}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            {type === 'other' && (
              <iframe
                src={url}
                title={label}
                className="w-full h-[70vh] min-h-[400px] rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
