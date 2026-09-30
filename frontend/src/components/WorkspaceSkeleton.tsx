export function WorkspaceSkeleton() {
  return (
    <div className="workspace-skeleton" role="status" aria-live="polite" aria-label="Loading practice priorities">
      <span className="sr-only">Loading practice priorities...</span>
      <div className="skeleton-block skeleton-header" />
      <div className="skeleton-metrics">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
    </div>
  );
}
