import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  to?: string;
  className?: string;
  /** Visually smaller variant for dense chrome such as the responder header. */
  compact?: boolean;
}

const BrandLogo = ({ to = '/', className, compact = false }: BrandLogoProps) => (
  <Link
    to={to}
    className={cn(
      'inline-flex items-center gap-2 rounded-md font-display font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      compact ? 'text-lg' : 'text-xl',
      className
    )}
  >
    <span
      className={cn(
        'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
        compact ? 'h-7 w-7' : 'h-8 w-8'
      )}
      aria-hidden="true"
    >
      <Heart className={compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} fill="currentColor" strokeWidth={0} />
    </span>
    <span>
      Uhai<span className="text-primary">Link</span>
    </span>
  </Link>
);

export default BrandLogo;
