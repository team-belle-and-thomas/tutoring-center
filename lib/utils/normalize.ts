// Supabase returning joins looks awful. If you ask for a single object, it returns an array with one item. If you ask for an array, it returns an array of arrays. If you ask for something that doesn't exist, it returns null or an empty array. It's a mess.
// These helpers normalize that into a single object (or null).

// If it's an array, return the first item. If it's an object, return it.
// If it's null/undefined or an empty array, return null.
export function pickFirstEmbedded<T>(embedded: T | T[] | null | undefined): T | null {
  if (embedded === null || embedded === undefined) return null;
  if (Array.isArray(embedded)) return embedded[0] ?? null;
  return embedded;
}

// Same as pickFirstEmbedded, but skips null/undefined items inside arrays.
// Handy if you ever see something like [null].
export function pickFirstNonNullEmbedded<T>(embedded: T | T[] | null | undefined): T | null {
  if (embedded === null || embedded === undefined) return null;
  if (!Array.isArray(embedded)) return embedded;

  for (const item of embedded) {
    if (item !== null && item !== undefined) return item;
  }

  return null;
}
