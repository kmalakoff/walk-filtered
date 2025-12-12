/**
 * Compatibility Layer for Node.js 0.8+ (Test Only)
 * Local to this package - contains only needed functions.
 */

/**
 * String.prototype.startsWith wrapper for Node.js 0.8+
 * - Uses native startsWith on Node 4.0+ / ES2015+
 * - Falls back to indexOf on Node 0.8-3.x
 */
const hasStartsWith = typeof String.prototype.startsWith === 'function';

export function stringStartsWith(str: string, search: string, position?: number): boolean {
  if (hasStartsWith) {
    return str.startsWith(search, position);
  }
  position = position || 0;
  return str.indexOf(search, position) === position;
}
