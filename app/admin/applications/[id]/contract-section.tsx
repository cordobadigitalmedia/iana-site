'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { generateContract, saveContractDraft, sendContract } from './actions';
import { DocumentPreviewLink } from './document-preview-dialog';

type Props = {
  applicationId: string;
  contractDraftContent: string | null;
  contractSentAt: string | null;
  signedContractUrl: string | null;
  contractSignedAt: string | null;
};

export function ContractSection({
  applicationId,
  contractDraftContent,
  contractSentAt,
  signedContractUrl,
  contractSignedAt,
}: Props) {
  const router = useRouter();
  const [isGeneratePending, startGenerateTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();
  const [isSendPending, startSendTransition] = useTransition();
  const [editableContent, setEditableContent] = useState(contractDraftContent ?? '');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (contractDraftContent != null && !contractSentAt) {
      setEditableContent(contractDraftContent);
    }
  }, [contractDraftContent, contractSentAt]);

  const hasDraft = (contractDraftContent ?? '').trim().length > 0;
  const canEdit = hasDraft && !contractSentAt;

  const handleGenerate = () => {
    startGenerateTransition(async () => {
      const result = await generateContract(applicationId);
      if (result?.error) alert(result.error);
      else {
        setEditableContent(editableContent || ''); // will be replaced by refresh
        router.refresh();
      }
    });
  };

  const handleSaveDraft = () => {
    startSaveTransition(async () => {
      setSaveMessage(null);
      const result = await saveContractDraft(applicationId, editableContent);
      if (result?.error) {
        setSaveMessage(result.error);
      } else {
        setSaveMessage('Draft saved.');
        router.refresh();
      }
    });
  };

  const handleSend = () => {
    if (!editableContent.trim()) {
      alert('Save the contract draft before sending.');
      return;
    }
    startSendTransition(async () => {
      await saveContractDraft(applicationId, editableContent);
      const result = await sendContract(applicationId);
      if (result?.error) alert(result.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {!hasDraft && (
        <p className="text-sm text-muted-foreground">
          Generate a contract from the template (filled with applicant name, date, amount, application ID). You can edit it before sending.
        </p>
      )}

      {!hasDraft && (
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGeneratePending}
        >
          {isGeneratePending ? 'Generating…' : 'Generate contract'}
        </Button>
      )}

      {hasDraft && (
        <>
          <div>
            <label htmlFor="contract-draft" className="block text-sm font-medium mb-1">
              Contract text (edit as needed before sending)
            </label>
            <textarea
              id="contract-draft"
              rows={18}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              disabled={!!contractSentAt}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono disabled:opacity-70"
            />
          </div>

          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSavePending}
              >
                {isSavePending ? 'Saving…' : 'Save draft'}
              </Button>
              <Button
                type="button"
                onClick={handleSend}
                disabled={isSendPending || isSavePending}
              >
                {isSendPending ? 'Sending…' : 'Send contract to applicant'}
              </Button>
              {saveMessage && <span className="text-sm text-muted-foreground">{saveMessage}</span>}
            </div>
          )}

          {contractSentAt && !contractSignedAt && (
            <p className="text-sm text-green-600 font-medium">
              Contract sent on {new Date(contractSentAt).toLocaleString()}. Applicant can review, download, sign, and upload at their unique link.
            </p>
          )}

          {contractSignedAt && (
            <div className="space-y-1">
              <p className="text-sm text-green-600 font-medium">
                Contract signed or accepted on {new Date(contractSignedAt).toLocaleString()}.
              </p>
              {signedContractUrl && (
                <p>
                  <DocumentPreviewLink
                    label="Signed contract"
                    url={signedContractUrl}
                    className="text-primary hover:underline text-sm"
                  >
                    View signed contract (PDF)
                  </DocumentPreviewLink>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
