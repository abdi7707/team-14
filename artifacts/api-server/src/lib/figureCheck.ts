import { MISSING_VALUE } from "@workspace/api-zod";

// Grouped thousands ("500,000", "1.500.000", "500 000", optional decimals) or a plain number.
const NUMBER_PATTERN = /\d{1,3}(?:[.,\u00a0 ]\d{3})+(?:[.,]\d{1,2})?(?!\d)|\d+(?:\.\d+)?/g;

// "500.000" may be five hundred or five hundred thousand, so accept either reading.
function readings(raw: string): number[] {
  return [raw.replace(/[,\u00a0 ]/g, ""), raw.replace(/[.,\u00a0 ]/g, "")]
    .map(Number)
    .filter(Number.isFinite);
}

/** Every number that appears in the facts given to the model. */
export function allowedFigures(facts: string): Set<number> {
  const allowed = new Set<number>();
  for (const [match] of facts.matchAll(NUMBER_PATTERN)) {
    for (const value of readings(match)) allowed.add(value);
  }
  return allowed;
}

/**
 * Replaces each number of 10 or more that is not in `allowed` with MISSING_VALUE,
 * so a figure the model invented or calculated never reaches the owner as fact.
 */
export function redactUnknownFigures(text: string, allowed: Set<number>) {
  let replaced = 0;
  const cleaned = text.replace(NUMBER_PATTERN, (match) => {
    const values = readings(match);
    if (values.every((value) => value < 10) || values.some((value) => allowed.has(value))) {
      return match;
    }
    replaced++;
    return MISSING_VALUE;
  });
  return { text: cleaned, replaced };
}
