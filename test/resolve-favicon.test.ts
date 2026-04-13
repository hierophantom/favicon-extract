import { describe, expect, it } from 'vitest';
import { resolveFavicon } from '../src/resolve-favicon';

describe('resolveFavicon', () => {
  it('returns none for invalid input', async () => {
    const result = await resolveFavicon('');

    expect(result.source).toBe('none');
    expect(result.faviconUrl).toBeNull();
    expect(result.candidates).toEqual([]);
  });

  it('normalizes host casing and protocol-less input', async () => {
    const result = await resolveFavicon('GitHub.com/path');

    expect(result.normalizedUrl).toContain('https://github.com/path');
  });

  it('prioritizes known domain overrides', async () => {
    const result = await resolveFavicon('https://docs.google.com/document/d/abc123/edit');

    expect(result.source).toBe('known-domain');
    expect(result.faviconUrl).toBe('https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico');
  });

  it('prioritizes domain_url for google hosts', async () => {
    const result = await resolveFavicon('https://www.google.com/search?q=abc#top');

    expect(result.candidates[0]).toContain('google.com/s2/favicons?domain_url=');
    expect(result.candidates[0]).toContain(encodeURIComponent('https://www.google.com/search'));
    expect(result.candidates[0]).not.toContain(encodeURIComponent('q=abc'));
  });

  it('prioritizes domain lookup for non-google hosts', async () => {
    const result = await resolveFavicon('https://yts.do');

    expect(result.candidates[0]).toContain('google.com/s2/favicons?domain=');
    expect(result.candidates[1]).toContain('google.com/s2/favicons?domain_url=');
  });

  it('can probe and pick first successful candidate', async () => {
    const result = await resolveFavicon('https://example.com', {
      probe: true,
      fetchImpl: async (input) => ({ ok: input.includes('/favicon.ico') })
    });

    expect(result.source).toBe('direct');
    expect(result.faviconUrl).toContain('/favicon.ico');
  });
});