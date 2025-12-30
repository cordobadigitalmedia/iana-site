'use client';

import { useState, useEffect } from 'react';

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function AutoSaveIndicator({ isSaving, lastSaved }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  if (isSaving) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span className="animate-pulse">●</span>
        <span>Saving...</span>
      </div>
    );
  }

  if (showSaved && lastSaved) {
    return (
      <div className="text-sm text-green-600 flex items-center gap-2">
        <span>✓</span>
        <span>Draft saved</span>
      </div>
    );
  }

  return null;
}


