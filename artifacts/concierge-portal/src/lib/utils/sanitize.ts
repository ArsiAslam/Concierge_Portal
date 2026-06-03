function stripHtml(input: string): string {
  let s = input
    // Remove script/style blocks and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  // Remove remaining tags
  s = s.replace(/<[^>]+>/g, ' ')
  // Decode HTML entities so a second pass catches encoded tags
  s = s
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x3C;/gi, '<')
    .replace(/&#60;/gi, '<')
  // Strip any tags revealed by decoding
  s = s.replace(/<[^>]+>/g, ' ')
  // Re-encode angle brackets that remain (raw < > in plain text)
  s = s.replace(/</g, '').replace(/>/g, '')
  return s.replace(/\s+/g, ' ').trim()
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input)
}

export function sanitizeEmail(input: unknown): string {
  const raw = sanitizeString(input)
  return raw.toLowerCase().replace(/[^a-z0-9._%+\-@]/g, '')
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    result[key] = typeof val === 'string' ? sanitizeString(val) : val
  }
  return result as T
}
