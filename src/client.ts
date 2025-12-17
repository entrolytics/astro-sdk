/**
 * Client-side tracking functions for Astro components
 *
 * @example
 * ```astro
 * ---
 * import { trackEvent } from '@entrolytics/astro/client';
 * ---
 *
 * <button onclick={`(${trackEvent})('button_click', { id: 'hero-cta' })`}>
 *   Click me
 * </button>
 * ```
 */

export interface EventData {
  [key: string]: string | number | boolean | EventData | string[] | number[] | EventData[];
}

// ============================================================================
// PHASE 2: Web Vitals Types
// ============================================================================

export type WebVitalMetric = 'LCP' | 'INP' | 'CLS' | 'TTFB' | 'FCP';
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';
export type NavigationType =
  | 'navigate'
  | 'reload'
  | 'back-forward'
  | 'back-forward-cache'
  | 'prerender'
  | 'restore';

export interface WebVitalData {
  metric: WebVitalMetric;
  value: number;
  rating: WebVitalRating;
  delta?: number;
  id?: string;
  navigationType?: NavigationType;
  attribution?: Record<string, unknown>;
}

// ============================================================================
// PHASE 2: Form Tracking Types
// ============================================================================

export type FormEventType =
  | 'start'
  | 'field_focus'
  | 'field_blur'
  | 'field_error'
  | 'submit'
  | 'abandon';

export interface FormEventData {
  eventType: FormEventType;
  formId: string;
  formName?: string;
  urlPath?: string;
  fieldName?: string;
  fieldType?: string;
  fieldIndex?: number;
  timeOnField?: number;
  timeSinceStart?: number;
  errorMessage?: string;
  success?: boolean;
}

declare global {
  interface Window {
    entrolytics?: {
      track: (eventName?: string | object, eventData?: Record<string, unknown>) => void;
      identify: (data: Record<string, unknown>) => void;
    };
    __entrolytics_config?: {
      websiteId: string;
      host: string;
    };
  }
}

function waitForTracker(callback: () => void): void {
  if (typeof window === 'undefined') return;

  const tryExecute = () => {
    if (window.entrolytics) {
      callback();
    } else {
      setTimeout(tryExecute, 100);
    }
  };

  tryExecute();
}

function getConfig(): { websiteId: string; host: string } | null {
  if (typeof window === 'undefined') return null;
  return window.__entrolytics_config || null;
}

/**
 * Track a custom event
 *
 * Can be used inline in onclick handlers or called from client-side scripts
 */
export function trackEvent(eventName: string, eventData?: EventData): void {
  waitForTracker(() => {
    window.entrolytics?.track(eventName, eventData);
  });
}

/**
 * Track revenue event
 *
 * @example
 * ```ts
 * trackRevenue('purchase', 99.99, 'USD', { productId: 'abc123' });
 * ```
 */
export function trackRevenue(
  eventName: string,
  revenue: number,
  currency = 'USD',
  data?: EventData,
): void {
  waitForTracker(() => {
    const eventData: EventData = {
      ...data,
      revenue,
      currency,
    };
    window.entrolytics?.track(eventName, eventData);
  });
}

/**
 * Track outbound link click
 */
export function trackOutboundLink(url: string, data?: EventData): void {
  waitForTracker(() => {
    window.entrolytics?.track('outbound-link-click', {
      ...data,
      url,
    });
  });
}

/**
 * Identify with custom data
 */
export function identify(data: EventData): void {
  waitForTracker(() => {
    window.entrolytics?.identify(data);
  });
}

/**
 * Identify a user by ID for logged-in tracking
 */
export function identifyUser(userId: string, traits?: EventData): void {
  waitForTracker(() => {
    window.entrolytics?.identify({ id: userId, ...traits });
  });
}

/**
 * Track a page view manually
 * Useful when using View Transitions or client-side routing
 */
export function trackPageView(url?: string, referrer?: string): void {
  waitForTracker(() => {
    const payload: Record<string, unknown> = {};
    if (url) payload.url = url;
    if (referrer) payload.referrer = referrer;
    window.entrolytics?.track(payload);
  });
}

// ============================================================================
// PHASE 2: Web Vitals Tracking
// ============================================================================

/**
 * Track a Web Vital metric
 *
 * @example
 * ```ts
 * import { onLCP, onINP, onCLS } from 'web-vitals';
 * import { trackVital } from '@entrolytics/astro/client';
 *
 * onLCP((metric) => trackVital({
 *   metric: 'LCP',
 *   value: metric.value,
 *   rating: metric.rating
 * }));
 * ```
 */
export async function trackVital(data: WebVitalData): Promise<void> {
  if (typeof window === 'undefined') return;

  const config = getConfig();
  if (!config) {
    console.warn('[Entrolytics] Config not found. Ensure integration is properly configured.');
    return;
  }

  const payload = {
    website: config.websiteId,
    metric: data.metric,
    value: data.value,
    rating: data.rating,
    delta: data.delta,
    id: data.id,
    navigationType: data.navigationType,
    attribution: data.attribution,
    url: window.location.href,
    path: window.location.pathname,
  };

  try {
    await fetch(`${config.host}/api/collect/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    console.error('[Entrolytics] Failed to track vital:', err);
  }
}

/**
 * Initialize automatic Web Vitals tracking
 * Call this in your client-side script to auto-track all Core Web Vitals
 *
 * @example
 * ```astro
 * <script>
 *   import { initWebVitals } from '@entrolytics/astro/client';
 *   initWebVitals();
 * </script>
 * ```
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');

    onLCP(m =>
      trackVital({
        metric: 'LCP',
        value: m.value,
        rating: m.rating,
        delta: m.delta,
        id: m.id,
        navigationType: m.navigationType as NavigationType,
        attribution: m.attribution as Record<string, unknown>,
      }),
    );

    onINP(m =>
      trackVital({
        metric: 'INP',
        value: m.value,
        rating: m.rating,
        delta: m.delta,
        id: m.id,
        navigationType: m.navigationType as NavigationType,
        attribution: m.attribution as Record<string, unknown>,
      }),
    );

    onCLS(m =>
      trackVital({
        metric: 'CLS',
        value: m.value,
        rating: m.rating,
        delta: m.delta,
        id: m.id,
        navigationType: m.navigationType as NavigationType,
        attribution: m.attribution as Record<string, unknown>,
      }),
    );

    onFCP(m =>
      trackVital({
        metric: 'FCP',
        value: m.value,
        rating: m.rating,
        delta: m.delta,
        id: m.id,
        navigationType: m.navigationType as NavigationType,
        attribution: m.attribution as Record<string, unknown>,
      }),
    );

    onTTFB(m =>
      trackVital({
        metric: 'TTFB',
        value: m.value,
        rating: m.rating,
        delta: m.delta,
        id: m.id,
        navigationType: m.navigationType as NavigationType,
        attribution: m.attribution as Record<string, unknown>,
      }),
    );
  } catch {
    console.debug('[Entrolytics] web-vitals not installed. Use trackVital() for manual tracking.');
  }
}

// ============================================================================
// PHASE 2: Form Tracking
// ============================================================================

/**
 * Track a form event
 *
 * @example
 * ```ts
 * import { trackFormEvent } from '@entrolytics/astro/client';
 *
 * trackFormEvent({
 *   eventType: 'submit',
 *   formId: 'contact-form',
 *   success: true
 * });
 * ```
 */
export async function trackFormEvent(data: FormEventData): Promise<void> {
  if (typeof window === 'undefined') return;

  const config = getConfig();
  if (!config) {
    console.warn('[Entrolytics] Config not found. Ensure integration is properly configured.');
    return;
  }

  const payload = {
    website: config.websiteId,
    eventType: data.eventType,
    formId: data.formId,
    formName: data.formName,
    urlPath: data.urlPath || window.location.pathname,
    fieldName: data.fieldName,
    fieldType: data.fieldType,
    fieldIndex: data.fieldIndex,
    timeOnField: data.timeOnField,
    timeSinceStart: data.timeSinceStart,
    errorMessage: data.errorMessage,
    success: data.success,
  };

  try {
    await fetch(`${config.host}/api/collect/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    console.error('[Entrolytics] Failed to track form event:', err);
  }
}

/**
 * Create a form tracker for a specific form
 *
 * @example
 * ```ts
 * const tracker = createFormTracker('signup-form', 'Signup Form');
 * tracker.trackStart();
 * tracker.trackFieldFocus('email', 'email', 0);
 * tracker.trackSubmit(true);
 * ```
 */
export function createFormTracker(formId: string, formName?: string) {
  let startTime: number | null = null;
  const fieldStartTimes = new Map<string, number>();

  return {
    trackStart: () => {
      startTime = Date.now();
      trackFormEvent({ eventType: 'start', formId, formName });
    },

    trackFieldFocus: (fieldName: string, fieldType?: string, fieldIndex?: number) => {
      if (!startTime) {
        startTime = Date.now();
        trackFormEvent({ eventType: 'start', formId, formName });
      }
      fieldStartTimes.set(fieldName, Date.now());
      trackFormEvent({
        eventType: 'field_focus',
        formId,
        formName,
        fieldName,
        fieldType,
        fieldIndex,
        timeSinceStart: Date.now() - startTime,
      });
    },

    trackFieldBlur: (fieldName: string, fieldType?: string, fieldIndex?: number) => {
      const fieldStart = fieldStartTimes.get(fieldName);
      trackFormEvent({
        eventType: 'field_blur',
        formId,
        formName,
        fieldName,
        fieldType,
        fieldIndex,
        timeOnField: fieldStart ? Date.now() - fieldStart : undefined,
        timeSinceStart: startTime ? Date.now() - startTime : undefined,
      });
    },

    trackFieldError: (
      fieldName: string,
      errorMessage: string,
      fieldType?: string,
      fieldIndex?: number,
    ) => {
      trackFormEvent({
        eventType: 'field_error',
        formId,
        formName,
        fieldName,
        fieldType,
        fieldIndex,
        errorMessage,
        timeSinceStart: startTime ? Date.now() - startTime : undefined,
      });
    },

    trackSubmit: (success: boolean) => {
      trackFormEvent({
        eventType: 'submit',
        formId,
        formName,
        success,
        timeSinceStart: startTime ? Date.now() - startTime : undefined,
      });
      startTime = null;
      fieldStartTimes.clear();
    },

    trackAbandon: () => {
      trackFormEvent({
        eventType: 'abandon',
        formId,
        formName,
        timeSinceStart: startTime ? Date.now() - startTime : undefined,
      });
    },
  };
}

// For inline script usage - attach to window
if (typeof window !== 'undefined') {
  (window as Window & { entrolyticsClient?: typeof import('./client') }).entrolyticsClient = {
    trackEvent,
    trackRevenue,
    trackOutboundLink,
    identify,
    identifyUser,
    trackPageView,
    // Phase 2
    trackVital,
    initWebVitals,
    trackFormEvent,
    createFormTracker,
  };
}
