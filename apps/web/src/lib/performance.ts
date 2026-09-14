import * as Sentry from '@sentry/nextjs';

interface PerformanceMetrics {
  name: string;
  duration: number;
  success: boolean;
  error?: Error;
}

const metrics: PerformanceMetrics[] = [];

export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  options?: { threshold?: number }
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    recordMetric({
      name,
      duration,
      success: true,
    });

    // Log slow requests
    if (options?.threshold && duration > options.threshold) {
      console.warn(`[SLOW] ${name}: ${duration.toFixed(2)}ms`);
      Sentry.captureMessage(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
        'warning'
      );
    } else {
      console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;

    recordMetric({
      name,
      duration,
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    });

    console.error(`[ERROR] ${name}: ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

export function recordMetric(metric: PerformanceMetrics) {
  metrics.push(metric);

  // Keep only last 100 metrics
  if (metrics.length > 100) {
    metrics.shift();
  }
}

export function getMetrics() {
  return metrics;
}

export function getMetricsReport() {
  if (metrics.length === 0) return null;

  const successful = metrics.filter(m => m.success);
  const failed = metrics.filter(m => !m.success);

  const avgDuration = successful.reduce((sum, m) => sum + m.duration, 0) / successful.length || 0;
  const maxDuration = Math.max(...successful.map(m => m.duration), 0);
  const minDuration = Math.min(...successful.map(m => m.duration), 0);

  return {
    totalMetrics: metrics.length,
    successful: successful.length,
    failed: failed.length,
    avgDuration: avgDuration.toFixed(2),
    maxDuration: maxDuration.toFixed(2),
    minDuration: minDuration.toFixed(2),
    failureRate: ((failed.length / metrics.length) * 100).toFixed(2) + '%',
  };
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  try {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('[LCP]', (entry as any).renderTime || (entry as any).loadTime);
      });
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observer not supported');
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          console.log('[CLS]', clsValue);
        }
      });
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS observer not supported');
  }

  // First Input Delay (FID) / Interaction to Next Paint (INP)
  try {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        const delay = (entry as any).processingStart - (entry as any).startTime;
        console.log('[INP]', delay.toFixed(2));
      });
    });
    observer.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('INP observer not supported');
  }
}
