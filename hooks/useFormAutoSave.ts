'use client';

import { useEffect, useCallback, useRef } from 'react';

export function useFormAutoSave(
  formKey: string,
  formData: Record<string, any>,
  onRestore?: (data: Record<string, any>) => void
) {
  const storageKey = `iana-form-${formKey}`;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isRestored = useRef(false);

  // Restore data on mount
  useEffect(() => {
    if (isRestored.current) return;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        onRestore?.(parsed);
        isRestored.current = true;
      }
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
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

  // Save on form data change
  useEffect(() => {
    if (isRestored.current) {
      saveToStorage(formData);
    }
  }, [formData, saveToStorage]);

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


