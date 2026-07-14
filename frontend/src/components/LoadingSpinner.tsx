export function LoadingSpinner() {
  return (
    <div
      aria-label="Loading"
      className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-brand"
      role="status"
    />
  );
}
