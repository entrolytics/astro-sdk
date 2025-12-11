# @entrolytics/astro

Astro SDK for [Entrolytics](https://ng.entrolytics.click) - First-party growth analytics for the edge.

## Installation

```bash
npm install @entrolytics/astro
# or
pnpm add @entrolytics/astro
```

## Quick Start

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import entrolytics from '@entrolytics/astro';

export default defineConfig({
  integrations: [
    entrolytics(), // Zero-config: reads from .env
  ],
});
```

Add to your `.env` file:

```bash
PUBLIC_ENTROLYTICS_NG_WEBSITE_ID=your-website-id
PUBLIC_ENTROLYTICS_HOST=https://ng.entrolytics.click
```

That's it! The integration automatically injects the tracking script and handles View Transitions.

## Configuration Options

### Zero-Config (Recommended)

```ts
integrations: [entrolytics()] // Reads from PUBLIC_ENTROLYTICS_NG_WEBSITE_ID
```

### Explicit Configuration

```ts
entrolytics({
  // Required: Your Entrolytics website ID
  websiteId: 'your-website-id',

  // Optional: Custom host (for self-hosted instances)
  host: 'https://ng.entrolytics.click',

  // Optional: Auto-track page views (default: true)
  autoTrack: true,

  // Optional: Track outbound link clicks (default: true)
  trackOutboundLinks: true,

  // Optional: Track file downloads (default: false)
  trackFileDownloads: false,

  // Optional: Respect Do Not Track (default: false)
  respectDnt: false,

  // Optional: Cross-domain tracking
  domains: ['example.com', 'blog.example.com'],
});
```

## Runtime Configuration

Entrolytics supports two collection runtimes with different performance characteristics:

### Edge Runtime (Default)

The edge runtime uses `/script-edge.js` for sub-50ms global latency:

```ts
entrolytics({
  websiteId: 'your-website-id',
  useEdgeRuntime: true, // Default
});
```

**Benefits:**
- Sub-50ms response times globally
- Optimal for high-traffic sites
- Best user experience

**Limitations:**
- Basic geo data (country-level)
- No ClickHouse export

### Node.js Runtime

The Node.js runtime uses `/script.js` with advanced capabilities:

```ts
entrolytics({
  websiteId: 'your-website-id',
  useEdgeRuntime: false, // Use Node.js runtime
});
```

**Benefits:**
- ClickHouse data export support
- MaxMind GeoIP (city-level accuracy)
- Advanced analytics features

**Latency:** 50-150ms (regional)

### When to Use Each Runtime

**Use Edge Runtime (default) when:**
- You prioritize speed (<50ms response times)
- You have high request volume
- Country-level geo data is sufficient

**Use Node.js Runtime when:**
- You need ClickHouse export for data warehousing
- You require city-level geo accuracy
- Self-hosted Astro deployments without edge support
- Advanced analytics workflows

See the [Routing documentation](https://ng.entrolytics.click/docs/concepts/routing) for more details.

## Manual Event Tracking

For tracking custom events in your Astro components:

```astro
---
// In your Astro component
---

<script>
  // Track a button click
  document.getElementById('my-button').addEventListener('click', () => {
    if (window.entrolytics) {
      window.entrolytics.track('button_click', {
        button_id: 'hero-cta',
        page: window.location.pathname
      });
    }
  });
</script>

<button id="my-button">Click me</button>
```

### Using the Client Module

```astro
---
import { trackEvent } from '@entrolytics/astro/client';
---

<script>
  import { trackEvent, identify } from '@entrolytics/astro/client';

  // Track events
  trackEvent('signup_click', { plan: 'pro' });

  // Identify users
  identify('user-123', { email: 'user@example.com' });
</script>
```

## View Transitions Support

The integration automatically works with Astro's View Transitions. Page views are re-tracked on each navigation.

## TypeScript

Full TypeScript support included:

```ts
import type { EntrolyticsOptions } from '@entrolytics/astro';

const options: EntrolyticsOptions = {
  websiteId: 'your-id',
  trackOutboundLinks: true,
};
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
