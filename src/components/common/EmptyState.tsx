import { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Consistent "nothing here yet" block; states plainly what is missing and what to do next. */
const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center', className)}>
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
    </span>
    <p className="font-semibold">{title}</p>
    {description && <div className="mt-1 max-w-md text-sm text-muted-foreground">{description}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
