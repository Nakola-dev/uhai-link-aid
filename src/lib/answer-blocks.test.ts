import { describe, expect, it } from 'vitest';
import { parseAnswer, parseInline, toneFor } from './answer-blocks';

describe('parseInline', () => {
  it('splits bold spans', () => {
    expect(parseInline('Call **999** now')).toEqual([
      { text: 'Call ', bold: false },
      { text: '999', bold: true },
      { text: ' now', bold: false },
    ]);
  });

  it('keeps markup-looking text as plain text', () => {
    const segments = parseInline('<script>alert(1)</script> <img src=x onerror=alert(1)>');
    expect(segments).toEqual([{ text: '<script>alert(1)</script> <img src=x onerror=alert(1)>', bold: false }]);
  });
});

describe('toneFor', () => {
  it('classifies the prompt-requested sections', () => {
    expect(toneFor('Immediate actions')).toBe('urgent');
    expect(toneFor('While waiting for help')).toBe('info');
    expect(toneFor('When to call 999 or 112')).toBe('warning');
    expect(toneFor('Background')).toBe('neutral');
  });
});

describe('parseAnswer', () => {
  it('parses headings, ordered and unordered lists, and paragraphs', () => {
    const blocks = parseAnswer([
      '### Immediate actions',
      '1. Check the scene is safe.',
      '2. Call **999**.',
      '',
      '**While waiting for help:**',
      '- Keep them warm',
      '* Stay with them',
      '',
      'Help is on the way.',
    ].join('\n'));

    expect(blocks.map((b) => b.type)).toEqual(['heading', 'list', 'heading', 'list', 'paragraph']);
    expect(blocks[0]).toMatchObject({ type: 'heading', tone: 'urgent' });
    expect(blocks[1]).toMatchObject({ type: 'list', ordered: true });
    expect(blocks[2]).toMatchObject({ type: 'heading', tone: 'info' });
    expect(blocks[3]).toMatchObject({ type: 'list', ordered: false, items: [[{ text: 'Keep them warm', bold: false }], [{ text: 'Stay with them', bold: false }]] });
  });

  it('treats a numbered bold line as a heading, not a list item', () => {
    const blocks = parseAnswer('1. **Immediate Actions**\n- Apply pressure');
    expect(blocks[0]).toMatchObject({ type: 'heading', tone: 'urgent' });
  });

  it('returns no blocks for empty input', () => {
    expect(parseAnswer('   \n\n')).toEqual([]);
  });
});
