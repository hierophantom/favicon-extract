export type FaviconSource =
  | 'google-s2'
  | 'duckduckgo'
  | 'direct'
  | 'known-domain'
  | 'none';

export interface ResolveFaviconOptions {
  size?: number;
  knownDomainOverrides?: Record<string, string>;
  probe?: boolean;
  fetchImpl?: FetchLike;
}

export interface ResolveFaviconResult {
  inputUrl: string;
  normalizedUrl: string;
  faviconUrl: string | null;
  source: FaviconSource;
  candidates: string[];
}

export interface FaviconCandidate {
  url: string;
  source: Exclude<FaviconSource, 'none'>;
}

export type FetchLike = (
  input: string,
  init?: { method?: string }
) => Promise<{ ok: boolean }>;