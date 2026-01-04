<div align="center">
  <img src="https://raw.githubusercontent.com/entrolytics/.github/main/media/entrov2.png" alt="Entrolytics" width="64" height="64">

  [![npm](https://img.shields.io/npm/v/@entrolytics/astro-sdk.svg?logo=npm)](https://www.npmjs.com/package/@entrolytics/astro-sdk)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Astro](https://img.shields.io/badge/Astro-5+-BC52EE.svg?logo=astro&logoColor=white)](https://astro.build/)

</div>

---

## Overview

**@entrolytics/astro-sdk** is the official Astro SDK for Entrolytics - first-party growth analytics for the edge. Add analytics to your Astro sites with a single integration.

**Why use this SDK?**
- Zero-config Astro integration - just add to `astro.config.mjs`
- Automatic View Transitions support
- Outbound link and file download tracking
- Edge-optimized with sub-50ms response times globally

## Key Features

<table>
<tr>
<td width="50%">

### Analytics
- Automatic page view tracking
- Outbound link tracking
- File download tracking
- Cross-domain tracking

</td>
<td width="50%">

### Developer Experience
- Astro integration plugin
- Client module for manual tracking
- View Transitions aware
- Full TypeScript support

</td>
</tr>
</table>

## Quick Start

<table>
<tr>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:download.svg?color=%236366f1" width="48"><br>
<strong>1. Install</strong><br>
<code>npm i @entrolytics/astro-sdk</code>
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:code.svg?color=%236366f1" width="48"><br>
<strong>2. Add Integration</strong><br>
<code>integrations: [entrolytics()]</code>
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:settings.svg?color=%236366f1" width="48"><br>
<strong>3. Configure</strong><br>
Set Website ID in <code>.env</code>
</td>
<td align="center" width="25%">
<img src="https://api.iconify.design/lucide:bar-chart-3.svg?color=%236366f1" width="48"><br>
<strong>4. Track</strong><br>
View analytics in dashboard
</td>
</tr>
</table>

## Installation

```bash
npm install @entrolytics/astro-sdk
# or
pnpm add @entrolytics/astro-sdk
```

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import entrolytics from '@entrolytics/astro-sdk';

export default defineConfig({
  integrations: [
    entrolytics(), // Zero-config: reads from .env
  ],
});
```

Add to your `.env` file:

```bash
PUBLIC_ENTROLYTICS_WEBSITE_ID=your-website-id
PUBLIC_ENTROLYTICS_HOST=https://entrolytics.click
```

That's it! The integration automatically injects the tracking script and handles View Transitions.

## Configuration Options

### Zero-Config (Recommended)

```ts
integrations: [entrolytics()] // Reads from PUBLIC_ENTROLYTICS_WEBSITE_ID
```

### Explicit Configuration

```ts
entrolytics({
  // Required: Your Entrolytics website ID
  websiteId: 'your-website-id',

  // Optional: Custom host (for self-hosted instances)
  host: 'https://entrolytics.click',

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

See the [Routing documentation](https://entrolytics.click/docs/concepts/routing) for more details.

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
