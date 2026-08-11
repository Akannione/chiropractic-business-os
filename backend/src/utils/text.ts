/**
 * Owner-facing summaries are read aloud and pasted into emails, so counts of
 * one must not render as "1 active patients" or "1 inquiries need follow-up".
 */

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

/** Renders the count and its noun together, e.g. `3 patient inquiries`. */
export function countOf(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${pluralize(count, singular, plural)}`;
}
