# Changelog

All notable changes to this project are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Breaking

- `clientKey` is a required option of the integration, read from `PUBLIC_ENTROLYTICS_CLIENT_KEY`
  or `VITE_ENTROLYTICS_CLIENT_KEY` when it is not passed. Without one the integration throws, as
  it does for a missing `websiteId`.
- `trackVital`, `initWebVitals` and the types `WebVitalData`, `WebVitalMetric`, `WebVitalRating`
  and `NavigationType` are removed from `/client` (and from `window.entrolyticsClient`), and
  `web-vitals` is no longer an optional dependency. The tracker script reports Core Web Vitals
  itself when `autoTrack` is on, so a second sender in the SDK would count every metric twice.
  Remove the calls; there is no replacement to call.

### Fixed

- The injected tracker script had no `data-client-key`, and the tracker sends nothing without it,
  so no page view, event or identify call made through this SDK reached Entrolytics. The script
  tag now carries the configured `clientKey`.
- `trackVital` posted a payload `/api/collect/vitals` rejected with HTTP 400 and ignored the
  response. Web Vitals now come from the tracker script.

## [3.0.3] - 2026-11-26

### Changed

- Built and released with pnpm 12.24.0. No code changes.

## [3.0.2] - 2026-11-26

### Changed

- Consumes `@entrolytics/shared` 3.2.1.
- Built and tested against Astro 7.4; dependencies updated to their latest releases and the
  toolchain moved to tsdown, the oxc tools and pnpm 12.23.

[Unreleased]: https://github.com/entrolytics/astro-sdk/compare/v3.0.3...HEAD
[3.0.3]: https://github.com/entrolytics/astro-sdk/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/entrolytics/astro-sdk/releases/tag/v3.0.2
