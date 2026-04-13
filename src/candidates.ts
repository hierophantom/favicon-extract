import type { FaviconCandidate } from './types.js';
import { getHostname, getNormalizedLookupUrl } from './normalize-url.js';

const DEFAULT_OVERRIDES: Record<string, string> = {
  'docs.google.com': 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
};

function isLikelyPublicDomain(hostname: string): boolean {
  if (!hostname) return false;
  if (hostname === 'localhost') return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  return hostname.includes('.');
}

function isGoogleHost(hostname: string): boolean {
  const normalizedHost = hostname.replace(/^www\./, '').toLowerCase();
  return normalizedHost === 'google.com' || normalizedHost.endsWith('.google.com');
}

function getGoogleDomainUrl(normalizedUrl: string, size: number): string | null {
  const hostname = getHostname(normalizedUrl);
  if (!isLikelyPublicDomain(hostname)) return null;

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=${size}`;
}

function getGoogleDomainUrlWithPath(normalizedUrl: string, size: number): string | null {
  const hostname = getHostname(normalizedUrl);
  if (!isLikelyPublicDomain(hostname)) return null;

  const lookup = getNormalizedLookupUrl(normalizedUrl);
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(lookup)}&sz=${size}`;
}

function getDuckDuckGoUrl(normalizedUrl: string): string | null {
  const hostname = getHostname(normalizedUrl);
  if (!hostname) return null;

  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`;
}

function getDirectFaviconUrl(normalizedUrl: string): string | null {
  try {
    const parsed = new URL(normalizedUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

export function buildCandidates(
  normalizedUrl: string,
  options?: { size?: number; knownDomainOverrides?: Record<string, string> }
): FaviconCandidate[] {
  const size = options?.size ?? 16;
  const hostname = getHostname(normalizedUrl);
  const overrides = { ...DEFAULT_OVERRIDES, ...(options?.knownDomainOverrides ?? {}) };

  const knownDomain = overrides[hostname];
  const domain = getGoogleDomainUrl(normalizedUrl, size);
  const domainUrl = getGoogleDomainUrlWithPath(normalizedUrl, size);
  const googleCandidates = isGoogleHost(hostname) ? [domainUrl, domain] : [domain, domainUrl];

  const ordered: Array<FaviconCandidate | null> = [
    knownDomain ? { url: knownDomain, source: 'known-domain' } : null,
    ...googleCandidates.filter(Boolean).map((url) => ({ url: url as string, source: 'google-s2' as const })),
    getDuckDuckGoUrl(normalizedUrl) ? { url: getDuckDuckGoUrl(normalizedUrl) as string, source: 'duckduckgo' } : null,
    getDirectFaviconUrl(normalizedUrl) ? { url: getDirectFaviconUrl(normalizedUrl) as string, source: 'direct' } : null
  ];

  const seen = new Set<string>();
  const deduped: FaviconCandidate[] = [];
  for (const candidate of ordered) {
    if (!candidate) continue;
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    deduped.push(candidate);
  }

  return deduped;
}