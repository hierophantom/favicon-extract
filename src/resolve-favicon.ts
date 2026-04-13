import { buildCandidates } from './candidates.js';
import { normalizeUrl } from './normalize-url.js';
import type {
  FaviconCandidate,
  FetchLike,
  ResolveFaviconOptions,
  ResolveFaviconResult
} from './types.js';

async function probeCandidates(
  candidates: FaviconCandidate[],
  fetchImpl?: FetchLike
): Promise<FaviconCandidate | null> {
  if (!fetchImpl) return candidates[0] ?? null;

  for (const candidate of candidates) {
    try {
      const head = await fetchImpl(candidate.url, { method: 'HEAD' });
      if (head.ok) return candidate;

      const get = await fetchImpl(candidate.url, { method: 'GET' });
      if (get.ok) return candidate;
    } catch {
      // Keep iterating through candidates.
    }
  }

  return null;
}

export async function resolveFavicon(
  input: string,
  options?: ResolveFaviconOptions
): Promise<ResolveFaviconResult> {
  const normalized = normalizeUrl(input);
  if (!normalized) {
    return {
      inputUrl: input,
      normalizedUrl: '',
      faviconUrl: null,
      source: 'none',
      candidates: []
    };
  }

  const candidates = buildCandidates(normalized, {
    size: options?.size,
    knownDomainOverrides: options?.knownDomainOverrides
  });

  const resolved = options?.probe
    ? await probeCandidates(candidates, options.fetchImpl)
    : (candidates[0] ?? null);

  return {
    inputUrl: input,
    normalizedUrl: normalized,
    faviconUrl: resolved?.url ?? null,
    source: resolved?.source ?? 'none',
    candidates: candidates.map((candidate) => candidate.url)
  };
}