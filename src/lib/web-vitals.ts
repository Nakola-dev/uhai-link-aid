/**
 * Core Web Vitals Monitoring
 *
 * Reports key performance metrics:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - LCP (Largest Contentful Paint)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Metrics are logged to console in development and can be sent
 * to an analytics endpoint in production.
 */

import type { Metric } from "web-vitals";

type MetricReporter = (metric: Metric) => void;

const VITALS_ENDPOINT = "/api/vitals"; // placeholder for production endpoint

/**
 * Default reporter that logs to console in development
 * and could POST to an analytics endpoint in production.
 */
const defaultReporter: MetricReporter = (metric) => {
  const { name, value, rating, id, delta } = metric;

  // Console logging with color-coded ratings
  const ratingColors: Record<string, string> = {
    good: "color: #0CCE6B; font-weight: bold",
    "needs-improvement": "color: #FFA400; font-weight: bold",
    poor: "color: #FF4E42; font-weight: bold",
  };

  if (import.meta.env.DEV) {
    console.log(
      `%c[Web Vitals] ${name}: ${Math.round(value * 100) / 100} (${rating})`,
      ratingColors[rating] || ""
    );
  }

  // In production, send to analytics endpoint
  if (import.meta.env.PROD) {
    // Use sendBeacon for reliable delivery even during page unload
    const body = JSON.stringify({
      name,
      value,
      rating,
      id,
      delta,
      url: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: getConnectionInfo(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(VITALS_ENDPOINT, body);
    } else {
      fetch(VITALS_ENDPOINT, {
        body,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // Silently fail - metrics are non-critical
      });
    }
  }
};

/**
 * Get network connection information if available
 */
function getConnectionInfo(): Record<string, unknown> | null {
  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  };

  if (nav.connection) {
    return {
      effectiveType: nav.connection.effectiveType,
      downlink: nav.connection.downlink,
      rtt: nav.connection.rtt,
      saveData: nav.connection.saveData,
    };
  }
  return null;
}

/**
 * Initialize Core Web Vitals monitoring.
 * Uses dynamic import to avoid adding to the initial bundle.
 */
export async function initWebVitals(
  reporter: MetricReporter = defaultReporter
): Promise<void> {
  try {
    const { onCLS, onFID, onLCP, onFCP, onTTFB, onINP } = await import(
      "web-vitals"
    );

    onCLS(reporter);
    onFID(reporter);
    onLCP(reporter);
    onFCP(reporter);
    onTTFB(reporter);
    onINP(reporter);
  } catch {
    // web-vitals failed to load - non-critical, continue silently
    if (import.meta.env.DEV) {
      console.warn("[Web Vitals] Failed to initialize web-vitals library");
    }
  }
}

/**
 * Get a performance summary for debugging.
 * Call this from the browser console: window.__getPerformanceSummary()
 */
export function getPerformanceSummary(): Record<string, unknown> {
  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  return {
    // Navigation timing
    dns: navigation ? Math.round(navigation.domainLookupEnd - navigation.domainLookupStart) : null,
    tcp: navigation ? Math.round(navigation.connectEnd - navigation.connectStart) : null,
    ttfb: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : null,
    domContentLoaded: navigation
      ? Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)
      : null,
    domComplete: navigation
      ? Math.round(navigation.domComplete - navigation.startTime)
      : null,

    // Resource counts
    totalResources: performance.getEntriesByType("resource").length,
    jsResources: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".js")).length,
    cssResources: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.endsWith(".css")).length,

    // Memory (Chrome only)
    memory: (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
      ? {
          used: `${Math.round(((performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024) * 100) / 100} MB`,
          total: `${Math.round(((performance as Performance & { memory: { totalJSHeapSize: number } }).memory.totalJSHeapSize / 1024 / 1024) * 100) / 100} MB`,
        }
      : null,

    // Service Worker
    serviceWorker: "serviceWorker" in navigator ? navigator.serviceWorker.controller?.state || "no controller" : "unsupported",
  };
}
