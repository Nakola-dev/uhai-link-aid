import { Fragment, ReactNode } from 'react';
import { AlertTriangle, Clock, Siren } from 'lucide-react';
import { AnswerBlock, InlineSegment, parseAnswer, SectionTone } from '@/lib/answer-blocks';
import { cn } from '@/lib/utils';

const Inline = ({ segments }: { segments: InlineSegment[] }) => (
  <>
    {segments.map((segment, i) =>
      segment.bold ? <strong key={i}>{segment.text}</strong> : <Fragment key={i}>{segment.text}</Fragment>
    )}
  </>
);

const TONE_STYLES: Record<SectionTone, { className: string; icon: typeof Siren | null }> = {
  urgent: { className: 'border-destructive bg-destructive/5 text-destructive', icon: Siren },
  warning: { className: 'border-warning bg-warning/10 text-warning', icon: AlertTriangle },
  info: { className: 'border-primary bg-primary/5 text-primary', icon: Clock },
  neutral: { className: 'border-transparent text-foreground', icon: null },
};

function renderBlock(block: AnswerBlock, key: number): ReactNode {
  switch (block.type) {
    case 'heading': {
      const tone = TONE_STYLES[block.tone];
      const Icon = tone.icon;
      return (
        <h3 key={key} className={cn('mt-4 first:mt-0 flex items-center gap-2 rounded-md border-l-4 px-3 py-1.5 text-sm font-semibold', tone.className)}>
          {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
          <span className={block.tone === 'neutral' ? '' : 'text-foreground'}><Inline segments={block.segments} /></span>
        </h3>
      );
    }
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List key={key} className={cn('my-2 space-y-1.5 pl-5', block.ordered ? 'list-decimal' : 'list-disc')}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1"><Inline segments={item} /></li>
          ))}
        </List>
      );
    }
    default:
      return (
        <p key={key} className="my-2 first:mt-0 last:mb-0">
          <Inline segments={block.segments} />
        </p>
      );
  }
}

/** Renders an assistant answer as structured, scannable sections. */
const AnswerContent = ({ text }: { text: string }) => (
  <div className="text-sm leading-relaxed">{parseAnswer(text).map(renderBlock)}</div>
);

export default AnswerContent;
