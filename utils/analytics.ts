'use client';

/**
 * Google Analytics 4 event tracking helper
 * 
 * @param eventName - GA4 event name
 * @param eventParams - GA4 event parameters
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Helper to check if analytics consent is given
 */
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('cookieConsent') === 'true';
};

/**
 * Helper to update consent status
 */
export const updateAnalyticsConsent = (granted: boolean): void => {
  if (typeof window === 'undefined' || typeof window.gtag === 'undefined') return;
  
  window.gtag('consent', 'update', {
    'analytics_storage': granted ? 'granted' : 'denied'
  });
  
  // Also update localStorage
  localStorage.setItem('cookieConsent', granted ? 'true' : 'false');
  
  // Push to dataLayer for GTM tracking
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    'event': granted ? 'cookie_consent_given' : 'cookie_consent_declined'
  });
}; 