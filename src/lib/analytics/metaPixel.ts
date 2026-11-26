// Safe Meta Pixel client-side helper preventing duplicate firing

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const firedEvents = new Set<string>();

/**
 * Safely dispatches a Meta Pixel event (`track` or `trackCustom`).
 * Guards against SSR execution, missing fbq initialization, and duplicate eventId firing.
 */
export function trackMetaPixelEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  if (eventId) {
    const key = `${eventName}:${eventId}`;
    if (firedEvents.has(key)) return;
    firedEvents.add(key);
    window.fbq('track', eventName, params || {}, { eventID: eventId });
    return;
  }

  window.fbq('track', eventName, params || {});
}
