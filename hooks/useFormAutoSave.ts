'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export function useFormAutoSave(
  formKey: string,
  formData: Record<string, any>,
  onRestore?: (data: Record<string, any>) => void
) {
  const storageKey = `iana-form-${formKey}`;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const restoreAttempted = useRef(false);

  // Only start saving after we've run restore, so we don't overwrite localStorage with {} before restore applies
  const [saveEnabled, setSaveEnabled] = useState(false);

  // Restore data on mount (runs once)
  useEffect(() => {
    if (restoreAttempted.current) return;
    restoreAttempted.current = true;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        onRestore?.(parsed);
      }
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
    // Allow saving after restore has run and (if we restored) the next render has the restored formData
    setSaveEnabled(true);
  }, [storageKey, onRestore]);

  // Auto-save with debounce
  const saveToStorage = useCallback((data: Record<string, any>) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }, 1500); // 1.5 second debounce
  }, [storageKey]);

  // Save on form data change — only after restore has run, so we never overwrite draft with empty {}
  useEffect(() => {
    if (!saveEnabled) return;
    saveToStorage(formData);
  }, [formData, saveToStorage, saveEnabled]);

  // Clear storage function
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  }, [storageKey]);

  return { clearStorage };
}


