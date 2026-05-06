/**
 * Accepts Issuu iframe {@code src} or a full HTML snippet; only https://*.issuu.com URLs are allowed.
 */
export function normalizeIssuuEmbedUrl(raw: string | null | undefined): string | null {
  if (raw == null || !String(raw).trim()) {
    return null;
  }
  let s = String(raw).trim();
  const iframeSrc = s.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeSrc?.[1]) {
    s = iframeSrc[1].trim();
  }
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') {
      return null;
    }
    const h = u.hostname.toLowerCase();
    if (h !== 'issuu.com' && !h.endsWith('.issuu.com')) {
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}
