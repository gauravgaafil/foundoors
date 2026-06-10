import type { WPFAQItem } from "@/types/wordpress";

/**
 * Parses FAQ text in the format:
 *   Q: Question one?
 *   A: Answer one.
 *
 *   Q: Question two?
 *   A: Answer two.
 *
 * into structured FAQ items. Lines must start with "Q:" or "A:" (case-insensitive).
 * Multi-line answers are supported until the next "Q:" line.
 */
export function parseFAQText(raw?: string | null): WPFAQItem[] {
  if (!raw) return [];

  const lines = raw.split("\n");
  const items: WPFAQItem[] = [];
  let current: { question: string; answer: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const qMatch = trimmed.match(/^Q[:.]?\s*(.*)$/i);
    const aMatch = trimmed.match(/^A[:.]?\s*(.*)$/i);

    if (qMatch) {
      if (current) {
        items.push({ question: current.question, answer: current.answer.join(" ").trim() });
      }
      current = { question: qMatch[1].trim(), answer: [] };
    } else if (aMatch && current) {
      current.answer.push(aMatch[1].trim());
    } else if (trimmed && current) {
      current.answer.push(trimmed);
    }
  }

  if (current) {
    items.push({ question: current.question, answer: current.answer.join(" ").trim() });
  }

  return items.filter((item) => item.question && item.answer);
}
