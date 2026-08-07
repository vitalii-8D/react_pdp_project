import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';

import { CommentFormField } from '../enums/comment-form-field.enum';
import { StarRating } from './StarRating';
import { Button } from './Button';
import { cardClassName } from './Card';

interface CommentFormProps {
  action: string;
  initialContent?: string;
  initialRating?: number;
  submitLabel: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({
  action,
  initialContent = '',
  initialRating = 0,
  submitLabel,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const fetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const wasSubmitting = useRef(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      wasSubmitting.current = true;
      return;
    }

    if (fetcher.state === 'idle' && wasSubmitting.current) {
      wasSubmitting.current = false;
      if (fetcher.data && !fetcher.data.error) {
        setContent(initialContent);
        setRating(initialRating);
        onSuccess?.();
      }
    }
  }, [fetcher.state, fetcher.data, initialContent, initialRating, onSuccess]);

  const pending = fetcher.state !== 'idle';
  const error = fetcher.data?.error;

  return (
    <fetcher.Form method="post" action={action} className={`${cardClassName} p-4 space-y-3`}>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      <textarea
        name={CommentFormField.Content}
        required
        rows={3}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Share your thoughts..."
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <StarRating value={rating} onChange={setRating} />
          <input type="hidden" name={CommentFormField.Rating} value={rating || ''} />
          <p className="text-xs text-slate-400 mt-1">Select a rating (required)</p>
        </div>

        <div className="flex items-center space-x-2">
          {onCancel && (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="sm" disabled={pending || rating === 0}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
