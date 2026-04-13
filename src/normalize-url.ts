export function normalizeUrl(input: string): string | null {
  const raw = (input || '').trim();
  if (!raw) return null;

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.href;
  } catch {
    return null;
  }
}

export function getNormalizedLookupUrl(normalizedUrl: string): string {
  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname.replace(/^www\./, '');
    const shouldStrip = host === 'google.com' || parsed.href.length > 512;

    if (shouldStrip) {
      parsed.search = '';
      parsed.hash = '';
    }

    return parsed.href;
  } catch {
    return normalizedUrl;
  }
}

export function getHostname(normalizedUrl: string): string {
  try {
    return new URL(normalizedUrl).hostname.toLowerCase();
  } catch {
    return '';
  }
}