/**
 * VIN normalization — clean OCR output and extract VIN candidates.
 */

/** Characters that OCR commonly confuses with valid VIN chars */
const OCR_REPLACEMENTS: [RegExp, string][] = [
  [/[oO]/g, "0"], // O → 0 (O not allowed in VIN)
  [/[iI]/g, "1"], // I → 1 (I not allowed in VIN)
  [/[qQ]/g, "9"], // Q → 9 (Q not allowed in VIN, 9 is close)
];

/**
 * Normalize raw text: uppercase, remove whitespace/special chars.
 */
export function normalizeVinText(raw: string): string {
  let text = raw.toUpperCase().replace(/[\s\-_.]/g, "");
  // Apply OCR-specific replacements
  for (const [pattern, replacement] of OCR_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

/**
 * Extract VIN candidates (17-char sequences) from OCR text.
 * Returns all potential VINs found in the text.
 */
export function extractVinCandidates(rawText: string): string[] {
  const normalized = normalizeVinText(rawText);
  const candidates: string[] = [];

  // Try to find 17-char sequences matching VIN charset
  const vinRegex = /[A-HJ-NPR-Z0-9]{17}/g;
  let match: RegExpExecArray | null;
  while ((match = vinRegex.exec(normalized)) !== null) {
    candidates.push(match[0]);
  }

  // If no exact match, try sliding window on cleaned text
  if (candidates.length === 0) {
    const cleaned = normalized.replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (cleaned.length >= 17) {
      for (let i = 0; i <= cleaned.length - 17; i++) {
        const candidate = cleaned.slice(i, i + 17);
        if (/^[A-HJ-NPR-Z0-9]{17}$/.test(candidate)) {
          candidates.push(candidate);
        }
      }
    }
  }

  return [...new Set(candidates)];
}
