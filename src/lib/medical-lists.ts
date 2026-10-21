/** Medical list fields (allergies, medications, conditions) are edited as comma-separated text. */
export const parseMedicalList = (text: string): string[] =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const formatMedicalList = (items: string[] | null | undefined): string => (items ?? []).join(', ');

/** Empty form strings must be stored as NULL — Postgres rejects '' for DATE columns. */
export const blankToNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());
