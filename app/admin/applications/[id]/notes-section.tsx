'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { addApplicationNote } from './actions';

export type NoteRow = {
  id: string;
  type: string;
  content: string;
  author_email: string | null;
  created_at: string;
};

type Props = {
  applicationId: string;
  notes: NoteRow[];
  canEdit: boolean;
};

const TYPE_LABELS: Record<string, string> = {
  note: 'Note',
  comment: 'Comment',
  approval: 'Approval',
};

export function NotesSection({ applicationId, notes, canEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<'note' | 'comment' | 'approval'>('note');
  const [content, setContent] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await addApplicationNote(applicationId, type, content.trim());
      if (result?.error) {
        alert(result.error);
        return;
      }
      setContent('');
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {notes.length === 0 ? (
          <li className="text-sm text-muted-foreground">No notes or comments yet.</li>
        ) : (
          notes.map((note) => (
            <li key={note.id} className="rounded-md border bg-muted/20 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-medium text-primary">
                  {TYPE_LABELS[note.type] ?? note.type}
                </span>
                {note.author_email && (
                  <span className="text-muted-foreground">{note.author_email}</span>
                )}
                <span className="text-muted-foreground text-xs">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{note.content}</p>
            </li>
          ))
        )}
      </ul>

      {canEdit && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-md border p-4">
          <h3 className="font-medium text-sm">Add note, comment, or approval</h3>
          <div>
            <label htmlFor="note-type" className="block text-sm font-medium mb-1">
              Type
            </label>
            <select
              id="note-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'note' | 'comment' | 'approval')}
              disabled={isPending}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="note">Note</option>
              <option value="comment">Comment</option>
              <option value="approval">Approval</option>
            </select>
          </div>
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="note-content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full max-w-xl"
              placeholder="e.g. Internal note, comment for team, or approval note (e.g. Guarantor approved)"
            />
          </div>
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? 'Adding…' : 'Add'}
          </Button>
        </form>
      )}
    </div>
  );
}
