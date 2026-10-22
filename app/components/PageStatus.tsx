import clsx from 'clsx';

// Inline error for a part of the page whose data failed to load, so the rest of the page (filters,
// the post itself, ...) still renders instead of falling through to the route's ErrorBoundary.
export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <p className={clsx('text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3', className)}>
      {message}
    </p>
  );
}
