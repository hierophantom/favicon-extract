# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning in spirit while the API is still settling.

## [0.1.0] - 2026-04-13

Initial extracted release.

### Added

- Standalone TypeScript favicon resolution library extracted from a production bookmark manager codebase.
- `resolveFavicon(input, options?)` as the primary public API.
- URL normalization for protocol-less input and noisy lookup URLs.
- Deterministic favicon candidate generation with ordered fallback strategy.
- Source support for known domain overrides, Google S2, DuckDuckGo, and direct `/favicon.ico`.
- Optional probing support with user-supplied `fetch` implementation.
- Vitest coverage for normalization, ordering, overrides, and probing behavior.
- CI workflow for build and test validation on GitHub.
- Local demo server and static GitHub Pages demo pipeline.

### Notes

- The package is currently intended for GitHub-first usage while the API stabilizes.
- npm publishing is intentionally deferred until there is at least one real consumer integration.