'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface StepContent {
  title: string;
  content: string;
}

interface ApplicationIntroProps {
  stepContents: {
    step1: StepContent;
    step2: StepContent;
    step3: StepContent;
  };
}

export function ApplicationIntro({ stepContents }: ApplicationIntroProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);

  const getStepContent = (step: number): StepContent | null => {
    switch (step) {
      case 1:
        return stepContents.step1;
      case 2:
        return stepContents.step2;
      case 3:
        return stepContents.step3;
      default:
        return null;
    }
  };

  // Filter out "Back to Applications Home" buttons and convert "Next" buttons to modal navigation
  const processContent = (content: string, currentStep: number): { content: string; hasNextButton: boolean; nextStepTitle: string } => {
    let processed = content;
    let hasNextButton = false;
    let nextStepTitle = '';
    
    // Remove "Back to Applications Home" buttons (with any attributes)
    processed = processed.replace(
      /<Button\s+[^>]*title="Back to Applications? Home"[^>]*\/?>/gi,
      ''
    );
    processed = processed.replace(
      /<Button\s+[^>]*title="Back to Application Home"[^>]*\/?>/gi,
      ''
    );
    
    // Extract and replace "Next" buttons
    const nextStepMap: Record<number, { step: number; title: string }> = {
      1: { step: 2, title: 'Next: Award Philosophy' },
      2: { step: 3, title: 'Next: Frequently Asked Questions' },
    };
    
    const nextInfo = nextStepMap[currentStep];
    if (nextInfo) {
      // Find and extract the Next button
      const nextButtonMatch = processed.match(/<Button\s+title="(Next:[^"]*)"\s+link="[^"]*"\s*\/?>/i);
      if (nextButtonMatch) {
        hasNextButton = true;
        nextStepTitle = nextInfo.title;
        // Remove the Next button from content
        processed = processed.replace(
          /<Button\s+title="Next:[^"]*"\s+link="[^"]*"\s*\/?>/gi,
          ''
        );
      }
    } else {
      // Step 4 - remove Next button if it exists
      processed = processed.replace(
        /<Button\s+title="Next:[^"]*"\s+link="[^"]*"\s*\/?>/gi,
        ''
      );
    }
    
    return { content: processed, hasNextButton, nextStepTitle };
  };

  const stepContent = openStep ? getStepContent(openStep) : null;
  const processed = stepContent && openStep !== null
    ? processContent(stepContent.content, openStep)
    : { content: '', hasNextButton: false, nextStepTitle: '' };

  const handleNextStep = () => {
    if (openStep && openStep < 3) {
      setOpenStep(openStep + 1);
    }
  };

  return (
    <>
      <div className="mb-8 space-y-4 p-6 bg-muted/50 rounded-lg">
        <p className="text-base">
          This preliminary application helps the IANA team assess your eligibility for a loan, and is an opportunity to share details about your situation. Please answer the questions below as accurately and completely as possible, to the best of your ability. Your information is kept in strict confidence and is not shared with other organizations.
        </p>
        
        <div>
          <h3 className="font-bold text-lg mb-2">Before Applying</h3>
          <p className="text-base">
            Before submitting your application, it is important that you review our guidelines. We welcome your preliminary application after reviewing the reference materials below. If you have reviewed these materials, you may proceed with your application:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setOpenStep(1)}
            className="text-blue-600 underline hover:text-blue-800 text-sm font-medium"
          >
            Before Applying
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => setOpenStep(2)}
            className="text-blue-600 underline hover:text-blue-800 text-sm font-medium"
          >
            Award Philosophy
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={() => setOpenStep(3)}
            className="text-blue-600 underline hover:text-blue-800 text-sm font-medium"
          >
            Frequently Asked Questions
          </button>
        </div>
      </div>

      <Dialog open={openStep !== null} onOpenChange={(open) => !open && setOpenStep(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{stepContent?.title || ''}</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none">
            <MarkdownRenderer content={processed.content} />
            {processed.hasNextButton && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleNextStep}>
                  {processed.nextStepTitle}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

