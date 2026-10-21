/**
 * Parses the assistant's markdown-like plain text into a small set of blocks
 * that are rendered as React elements. Nothing is ever injected as HTML, so
 * model output cannot introduce markup or scripts.
 */

export type InlineSegment = { text: string; bold: boolean };

export type SectionTone = 'urgent' | 'warning' | 'info' | 'neutral';

export type AnswerBlock =
  | { type: 'heading'; segments: InlineSegment[]; tone: SectionTone }
  | { type: 'paragraph'; segments: InlineSegment[] }
  | { type: 'list'; ordered: boolean; items: InlineSegment[][] };

/** Split **bold** spans; strip other inline markdown markers to plain text. */
export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  const clean = (s: string) => s.replace(/`([^`]*)`/g, '$1').replace(/(^|\s)[*_](\S[^*_]*?)[*_](?=\s|$|[.,;:!?])/g, '$1$2');
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) segments.push({ text: clean(text.slice(last, match.index)), bold: false });
    segments.push({ text: clean(match[1]), bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: clean(text.slice(last)), bold: false });
  return segments.filter((s) => s.text.length > 0);
}

export function toneFor(heading: string): SectionTone {
  const text = heading.toLowerCase();
  if (/immediate|right now|do this now|first steps?/.test(text)) return 'urgent';
  if (/when to call|call (999|112|emergency)|danger|warning|seek (urgent|emergency)|red flags?/.test(text)) return 'warning';
  if (/while waiting|until help|ongoing|aftercare|next steps?/.test(text)) return 'info';
  return 'neutral';
}

const HEADING = /^(#{1,6})\s+(.+?)\s*#*$/;
// A whole line in bold, optionally numbered and/or ending with a colon, reads as a heading.
const BOLD_HEADING = /^(?:\d+[.)]\s*)?\*\*(.+?)\*\*:?\s*$/;
const ORDERED = /^\d+[.)]\s+(.+)$/;
const BULLET = /^[-*•]\s+(.+)$/;

export function parseAnswer(raw: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let list: Extract<AnswerBlock, { type: 'list' }> | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', segments: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const rawLine of raw.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line || /^[-*_]{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(HEADING) ?? line.match(BOLD_HEADING);
    if (heading) {
      flushParagraph();
      flushList();
      const text = (heading.length === 3 ? heading[2] : heading[1]).replace(/\*\*/g, '').replace(/:$/, '');
      blocks.push({ type: 'heading', segments: parseInline(text), tone: toneFor(text) });
      continue;
    }

    const ordered = line.match(ORDERED);
    const bullet = line.match(BULLET);
    if (ordered || bullet) {
      flushParagraph();
      const isOrdered = !!ordered;
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { type: 'list', ordered: isOrdered, items: [] };
      }
      list.items.push(parseInline((ordered ?? bullet)![1]));
      continue;
    }

    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}
