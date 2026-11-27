export const Skeleton = ({ className = "", ...props }: any) => {
  return <div className={`animate-pulse rounded-md bg-surface-container-highest ${className}`} {...props} />;
};

/** A vertical stack of skeleton rows for list-shaped loading states. */
export const SkeletonList = ({ rows = 3, className = "" }: { rows?: number; className?: string }) => {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default Skeleton;
