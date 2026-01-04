import type { AstroIntegration } from 'astro';

const DEFAULT_HOST = 'https://entrolytics.click';

export interface EntrolyticsOptions {
  /**
   * Your Entrolytics website ID
   */
  websiteId: string;

  /**
   * Entrolytics host URL (for self-hosted instances)
   * @default 'https://entrolytics.click'
   */
  host?: string;

  /**
   * Automatically track page views
   * @default true
   */
  autoTrack?: boolean;

  /**
   * Track outbound link clicks automatically
   * @default true
   */
  trackOutboundLinks?: boolean;

  /**
   * Track file downloads (pdf, zip, etc.)
   * @default false
   */
  trackFileDownloads?: boolean;

  /**
   * Respect browser Do Not Track setting
   * @default false
   */
  respectDnt?: boolean;

  /**
   * Domains for cross-domain tracking
   */
  domains?: string[];

  /**
   * Cache tracking script locally
   * @default false
   */
  cacheScript?: boolean;

  /**
   * Use edge runtime endpoints for faster response times
   * @default true
   */
  useEdgeRuntime?: boolean;

  /**
   * Custom tag for A/B testing
   */
  tag?: string;

  /**
   * Strip query parameters from URLs
   * @default false
   */
  excludeSearch?: boolean;

  /**
   * Strip hash from URLs
   * @default false
   */
  excludeHash?: boolean;
}

function generateScriptTag(options: EntrolyticsOptions): string {
  const {
    websiteId,
    host = DEFAULT_HOST,
    autoTrack = true,
    trackOutboundLinks = true,
    trackFileDownloads = false,
    respectDnt = false,
    domains,
    useEdgeRuntime = true,
    tag,
    excludeSearch = false,
    excludeHash = false,
  } = options;

  // Use edge runtime script if enabled
  const scriptPath = useEdgeRuntime ? '/script-edge.js' : '/script.js';
  const scriptUrl = `${host.replace(/\/$/, '')}${scriptPath}`;

  const attributes: string[] = [`src="${scriptUrl}"`, `data-website-id="${websiteId}"`, 'defer'];

  if (!autoTrack) {
    attributes.push('data-auto-track="false"');
  }

  if (trackOutboundLinks) {
    attributes.push('data-track-outbound-links="true"');
  }

  if (trackFileDownloads) {
    attributes.push('data-track-file-downloads="true"');
  }

  if (respectDnt) {
    attributes.push('data-do-not-track="true"');
  }

  if (domains && domains.length > 0) {
    attributes.push(`data-domains="${domains.join(',')}"`);
  }

  if (tag) {
    attributes.push(`data-tag="${tag}"`);
  }

  if (excludeSearch) {
    attributes.push('data-exclude-search="true"');
  }

  if (excludeHash) {
    attributes.push('data-exclude-hash="true"');
  }

  return `<script ${attributes.join(' ')}></script>`;
}

/**
 * Astro integration for Entrolytics analytics
 *
 * @example
 * Zero-config (reads from import.meta.env):
 * ```ts
 * // astro.config.mjs
 * import { defineConfig } from 'astro/config';
 * import entrolytics from '@entrolytics/astro';
 *
 * export default defineConfig({
 *   integrations: [entrolytics()],
 * });
 * ```
 *
 * @example
 * Explicit config:
 * ```ts
 * export default defineConfig({
 *   integrations: [
 *     entrolytics({
 *       websiteId: 'your-website-id',
 *     }),
 *   ],
 * });
 * ```
 */
export default function entrolytics(options: Partial<EntrolyticsOptions> = {}): AstroIntegration {
  // Auto-read from environment variables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env || {};
  const websiteId =
    options.websiteId || env.PUBLIC_ENTROLYTICS_WEBSITE_ID || env.VITE_ENTROLYTICS_WEBSITE_ID;

  const host =
    options.host || env.PUBLIC_ENTROLYTICS_HOST || env.VITE_ENTROLYTICS_HOST || DEFAULT_HOST;

  if (!websiteId) {
    if (env.DEV) {
      console.warn(
        '[@entrolytics/astro] Missing websiteId. Add PUBLIC_ENTROLYTICS_WEBSITE_ID to your .env file.',
      );
    }
    throw new Error('[@entrolytics/astro] websiteId is required');
  }

  const finalOptions: EntrolyticsOptions = {
    websiteId, // Required - guaranteed to exist from validation above
    host,
    autoTrack: options.autoTrack,
    trackOutboundLinks: options.trackOutboundLinks,
    trackFileDownloads: options.trackFileDownloads,
    respectDnt: options.respectDnt,
    domains: options.domains,
    cacheScript: options.cacheScript,
    useEdgeRuntime: options.useEdgeRuntime,
    tag: options.tag,
    excludeSearch: options.excludeSearch,
    excludeHash: options.excludeHash,
  };

  return {
    name: '@entrolytics/astro',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        const scriptTag = generateScriptTag(finalOptions);

        // Inject config for Phase 2 features (Web Vitals, Forms)
        const configScript = `
          <script>
            window.__entrolytics_config = {
              websiteId: "${websiteId}",
              host: "${host.replace(/\/$/, '')}"
            };
          </script>
        `;

        // Inject config first, then main script
        injectScript('head-inline', configScript);
        injectScript('head-inline', scriptTag);

        // Handle View Transitions - re-track page on navigation
        injectScript(
          'page',
          `
          document.addEventListener('astro:page-load', () => {
            if (typeof window.entrolytics !== 'undefined' && window.entrolytics.track) {
              // The script handles this automatically with data-auto-track
              // This is a fallback for View Transitions
            }
          });
        `,
        );
      },
    },
  };
}

export type { AstroIntegration };
