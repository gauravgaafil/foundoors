import type { WPFAQItem } from "@/types/wordpress";

/**
 * Parses FAQ text in the format:
 *   Q: Question one? A: Answer one.
 *   Q: Question two? A: Answer two.
 *
 * Works whether pairs are separated by newlines or all on one line —
 * some field types (e.g. ACF "Text") strip newline characters on save,
 * so this matches "Q:" / "A:" markers anywhere in the string.
 */
export function parseFAQText(raw?: string | null): WPFAQItem[] {
  if (!raw) return [];

  const normalized = raw.replace(/\r\n/g, "\n");
  const items: WPFAQItem[] = [];

  const pairRegex = /Q[:.]?\s*(.*?)\s*A[:.]?\s*(.*?)(?=\s*Q[:.]|$)/gis;
  let match: RegExpExecArray | null;

  while ((match = pairRegex.exec(normalized)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();
    if (question && answer) {
      items.push({ question, answer });
    }
  }

  return items;
}
