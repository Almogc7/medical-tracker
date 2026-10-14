/**
 * Wraps user-provided text (names, titles) in Unicode first-strong isolates before it is placed inside a
 * translated sentence or an accessible label, so a Latin name in a Hebrew sentence (or the reverse) cannot
 * reorder the surrounding words or punctuation. Block-level user text uses dir="auto" in the markup instead.
 */
export const isolate = (text: string) => `\u2068${text}\u2069`;
