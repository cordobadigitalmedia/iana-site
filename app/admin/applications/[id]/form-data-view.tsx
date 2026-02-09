'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';

type FormDataViewProps = {
  formData: Record<string, unknown>;
  fileKeys: string[];
  applicationId: string;
  /** Field names in the order they appear on the user form (from schema) */
  orderedFieldNames?: string[];
};

function flattenFormData(
  obj: Record<string, unknown>,
  prefix = ''
): Array<{ key: string; value: string }> {
  const rows: Array<{ key: string; value: string }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      !(typeof v === 'object' && 'then' in v)
    ) {
      const isPlain =
        Object.prototype.toString.call(v) === '[object Object]';
      if (isPlain) {
        rows.push(
          ...flattenFormData(v as Record<string, unknown>, fullKey)
        );
      } else {
        rows.push({
          key: fullKey,
          value: Array.isArray(v) ? v.join(', ') : String(v),
        });
      }
    } else {
      rows.push({
        key: fullKey,
        value: v == null ? '' : String(v),
      });
    }
  }
  return rows;
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\./g, ' / ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: Array<{ key: string; value: string }>): string {
  const header = 'Field,Value';
  const body = rows
    .map((r) => `${escapeCsvValue(r.key)},${escapeCsvValue(r.value)}`)
    .join('\r\n');
  return `${header}\r\n${body}`;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sortRowsByFormOrder(
  rows: Array<{ key: string; value: string }>,
  orderedFieldNames: string[]
): Array<{ key: string; value: string }> {
  if (orderedFieldNames.length === 0) return rows;
  const orderMap = new Map(orderedFieldNames.map((name, i) => [name, i]));
  return [...rows].sort((a, b) => {
    const orderA = orderForKey(a.key, orderMap);
    const orderB = orderForKey(b.key, orderMap);
    if (orderA !== orderB) return orderA - orderB;
    return a.key.localeCompare(b.key);
  });
}

function orderForKey(
  key: string,
  orderMap: Map<string, number>
): number {
  if (orderMap.has(key)) return orderMap.get(key)!;
  const topLevel = key.split('.')[0];
  if (orderMap.has(topLevel)) return orderMap.get(topLevel)! + 0.5;
  return 9999;
}

export function FormDataView({
  formData,
  fileKeys,
  applicationId,
  orderedFieldNames = [],
}: FormDataViewProps) {
  const fileKeySet = new Set(fileKeys);
  let rows = flattenFormData(formData).filter(
    (r) => !fileKeySet.has(r.key)
  );
  rows = sortRowsByFormOrder(rows, orderedFieldNames);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleExportCsv = () => {
    const csv = buildCsv(rows);
    const shortId = applicationId.slice(0, 8);
    downloadCsv(csv, `application-${shortId}-form-data.csv`);
  };

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No form data to display.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Copy individual values with the copy button. Export all data as CSV
          below.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="shrink-0"
        >
          <Download className="mr-2 size-4" />
          Export as CSV
        </Button>
      </div>
      <div className="rounded-md border bg-muted/30 divide-y divide-border max-h-[500px] overflow-y-auto">
        {rows.map(({ key, value }) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="sm:w-48 shrink-0">
              <span className="text-sm font-medium text-foreground">
                {humanizeKey(key)}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex items-start gap-2">
              <div className="flex-1 min-w-0 rounded border bg-background px-2 py-1.5 text-sm break-words select-all font-mono">
                {value || '—'}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 size-8 p-0"
                onClick={() => handleCopy(key, value)}
                title="Copy value"
              >
                {copiedKey === key ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
