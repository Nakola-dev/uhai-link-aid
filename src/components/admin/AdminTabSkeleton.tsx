import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton loading state for admin tab cards.
 * Shows a card with animated placeholder rows.
 */
const AdminTabSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </CardContent>
  </Card>
);

export default AdminTabSkeleton;
