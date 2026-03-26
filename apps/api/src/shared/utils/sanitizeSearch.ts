/**
 * Sanitize user input for use in PostgreSQL ILIKE queries.
 *
 * Escapes special characters that have meaning in LIKE/ILIKE patterns:
 * - % (wildcard: any sequence of characters)
 * - _ (wildcard: any single character)
 * - \ (escape character itself)
 *
 * @example
 * sanitizeSearchInput('100%') → '100\\%'
 * sanitizeSearchInput('test_user') → 'test\\_user'
 */
export function sanitizeSearchInput(keyword: string): string {
  return keyword
    .replace(/\\/g, '\\\\')   // Escape backslash first
    .replace(/%/g, '\\%')     // Escape percent
    .replace(/_/g, '\\_');     // Escape underscore
}
