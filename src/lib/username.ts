/**
 * Generates a username from a full name:
 * First name in lowercase + initial of each following name.
 *
 * Examples:
 * - "Khin Andrei Gamboa" -> "khinag"
 * - "Maria Santos" -> "marias"
 * - "John Paul Smith" -> "johnps"
 */
export function generateUsername(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const firstName = parts[0].replace(/[^a-z0-9]/g, '');
  const initials = parts.slice(1).map((p) => p.replace(/[^a-z0-9]/g, '')[0] || '').join('');
  return `${firstName}${initials}`;
}
