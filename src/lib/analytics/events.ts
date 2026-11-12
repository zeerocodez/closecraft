/**
 * CloseCraft 2.0 Standard Conversion Events
 */
export type ConversionEventName =
  | 'registration_started'
  | 'registration_completed'
  | 'onboarding_completed'
  | 'service_viewed'
  | 'package_selected'
  | 'checkout_started'
  | 'purchase_completed'
  | 'affiliate_registration'
  | 'referral_conversion'
  | 'inquiry_submitted';

export function trackConversionEvent(eventName: ConversionEventName, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  try {
    // 1. Google Analytics 4 (gtag)
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    }

    // 2. Google Tag Manager (dataLayer)
    if (Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Meta / Facebook Pixel (fbq)
    if (typeof (window as any).fbq === 'function') {
      if (eventName === 'purchase_completed') {
        (window as any).fbq('track', 'Purchase', {
          value: params.value,
          currency: params.currency || 'NGN',
        });
      } else if (eventName === 'checkout_started') {
        (window as any).fbq('track', 'InitiateCheckout', params);
      } else if (eventName === 'registration_completed') {
        (window as any).fbq('track', 'CompleteRegistration', params);
      } else if (eventName === 'inquiry_submitted') {
        (window as any).fbq('track', 'Lead', params);
      } else {
        (window as any).fbq('trackCustom', eventName, params);
      }
    }

    // Console debug logging in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics Event] ${eventName}:`, params);
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
}
