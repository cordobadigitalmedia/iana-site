'use client';

import { Check, Circle } from 'lucide-react';

export type FinalAppProgressStep = {
  id: string;
  label: string;
  done: boolean;
};

type Props = {
  steps: FinalAppProgressStep[];
};

export function FinalApplicationProgress({ steps }: Props) {
  return (
    <div className="mb-6 rounded-lg border bg-muted/30 px-4 py-3">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Review & approval process
      </p>
      <nav aria-label="Application progress" className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-1.5">
            {index > 0 && (
              <span
                className="hidden shrink-0 text-muted-foreground/50 sm:inline"
                aria-hidden
              >
                →
              </span>
            )}
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ${
                step.done
                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.done ? (
                <Check className="size-3.5 shrink-0" aria-hidden />
              ) : (
                <Circle className="size-3.5 shrink-0 opacity-60" aria-hidden />
              )}
              <span>{step.label}</span>
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
