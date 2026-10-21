import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** Heading level; sections inside a page are h2 by default. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

const SectionHeading = ({ id, eyebrow, title, description, align = 'left', as: Tag = 'h2', className }: SectionHeadingProps) => (
  <div className={cn('max-w-2xl space-y-3', align === 'center' && 'mx-auto text-center', className)}>
    {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
    <Tag id={id} className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
      {title}
    </Tag>
    {description && <p className="text-lg text-muted-foreground text-pretty">{description}</p>}
  </div>
);

export default SectionHeading;
