// Security Sanitization Utility for Frontend Inputs & Text

/**
 * Escapes potentially malicious HTML characters to prevent XSS (Cross-Site Scripting)
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates and cleans numeric financial inputs, guaranteeing positive non-NaN float values
 */
export function sanitizeNumber(value, min = 0, max = 1000000) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  if (num < min) return min;
  if (num > max) return max;
  return parseFloat(num.toFixed(2));
}

/**
 * Validates alphanumeric strings (Order Numbers, Tech Names) allowing only safe characters
 */
export function sanitizeSafeName(input, maxLength = 100) {
  if (typeof input !== 'string') return '';
  // Remove HTML tags and dangerous characters like <, >, {, }, /, \
  const clean = input.replace(/<[^>]*>/g, '').replace(/[<>{}\/\\]/g, '').trim();
  return clean.substring(0, maxLength);
}
