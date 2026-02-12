import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardSkeletonProps {
  /** Number of stat cards to show (top row) */
  cards?: number;
  /** Number of list rows to show */
  rows?: number;
  /** Show a header/title skeleton */
  showHeader?: boolean;
}

/**
 * Consistent skeleton loading state for dashboard pages.
 * Replaces inconsistent spinner patterns throughout the app.
 */
const DashboardSkeleton = ({ cards = 3, rows = 4, showHeader = true }: DashboardSkeletonProps) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    {/* Header skeleton */}
    {showHeader && (
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
    )}

    {/* Stat cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Content rows skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

/**
 * Simple centered loading spinner for non-dashboard contexts
 * (e.g. Suspense fallback, full-page loads).
 */
export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
);

export default DashboardSkeleton;
