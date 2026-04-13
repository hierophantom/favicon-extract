# favicon-extract

A tiny library that discovers, normalizes, and resolves the best favicon for a URL.

Originally extracted from a production bookmark manager codebase into a standalone, framework-agnostic package.

## Install

```bash
npm install favicon-extract
```

## API

```ts
import { resolveFavicon } from 'favicon-extract';

const result = await resolveFavicon('https://docs.google.com/document/d/abc123/edit');
```

```ts
const result = await resolveFavicon('github.com', {
  size: 32,
  probe: true,
  fetchImpl: fetch,
  knownDomainOverrides: {
    'docs.google.com': 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  }
});
```

Result shape:

```ts
interface ResolveFaviconResult {
  inputUrl: string;
  normalizedUrl: string;
  faviconUrl: string | null;
  source: 'google-s2' | 'duckduckgo' | 'direct' | 'known-domain' | 'none';
  candidates: string[];
}
```

Options:

- `size?: number` candidate icon size hint for provider URLs.
- `knownDomainOverrides?: Record<string, string>` custom high-priority overrides.
- `probe?: boolean` actively probe candidates and return the first reachable icon.
- `fetchImpl?: (input, init?) => Promise<{ ok: boolean }>` fetch implementation used when probing.

## Resolution Strategy

The resolver generates deterministic candidates and picks the best match.

Priority:

1. Known domain override
2. Google S2 (`domain` or `domain_url`, host-sensitive ordering)
3. DuckDuckGo icon proxy
4. Direct `/favicon.ico`

## Notes

- Runtime is environment-agnostic: no DOM helpers and no Chrome-specific APIs.
- Candidate ordering is deterministic and based on host heuristics.
- Optional probing can verify candidates using a user-supplied fetch implementation.

## Development

```bash
npm install
npm run build
npm test
```

## Demo

This repo includes a small visual test harness under `demo/`.

Hosted demo:

```text
https://hierophantom.github.io/favicon-extract/
```

```bash
npm install
npm run build
npm run build:site
npm run demo
```

Then open:

```text
http://localhost:4173/
```

The GitHub Pages deployment is handled by the Pages workflow on pushes to `main`.