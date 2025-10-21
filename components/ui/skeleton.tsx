import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-white/5';

  const variantClasses = {
    default: 'rounded',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <Skeleton className="h-10 w-10 mb-3 mx-auto" variant="circular" />
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" variant="text" />
      <Skeleton className="h-4 w-full mb-1" variant="text" />
      <Skeleton className="h-4 w-5/6 mx-auto mb-3" variant="text" />
      <Skeleton className="h-3 w-1/2 mx-auto" variant="text" />
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <Skeleton className="h-4 w-32 mb-2" variant="text" />
          <Skeleton className="h-8 w-16 mb-2" variant="text" />
          <Skeleton className="h-3 w-24" variant="text" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" variant="rectangular" />
          <Skeleton className="h-12 w-24" variant="rectangular" />
        </div>
      ))}
    </div>
  );
}
