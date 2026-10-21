import { describe, expect, it } from 'vitest';
import { blankToNull, formatMedicalList, parseMedicalList } from './medical-lists';

describe('medical list helpers', () => {
  it('parses comma-separated text and drops empty entries', () => {
    expect(parseMedicalList(' Penicillin, , Peanuts ,')).toEqual(['Penicillin', 'Peanuts']);
  });

  it('round-trips through formatting', () => {
    expect(parseMedicalList(formatMedicalList(['Asthma', 'Diabetes']))).toEqual(['Asthma', 'Diabetes']);
    expect(formatMedicalList(null)).toBe('');
  });

  it('converts blank optional fields to null (Postgres DATE rejects "")', () => {
    expect(blankToNull('')).toBeNull();
    expect(blankToNull('   ')).toBeNull();
    expect(blankToNull(' 1990-05-01 ')).toBe('1990-05-01');
  });
});
