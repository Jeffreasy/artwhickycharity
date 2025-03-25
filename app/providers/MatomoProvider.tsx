'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MATOMO_CONFIG } from '../config/matomo';

export function MatomoProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize Matomo Tag Manager
    if (MATOMO_CONFIG.ENABLE_TRACKING) {
      const _mtm = (window._mtm = window._mtm || []);
      _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });

      const d = document;
      const g = d.createElement('script');
      const s = d.getElementsByTagName('script')[0];
      
      g.async = true;
      g.src = `${MATOMO_CONFIG.URL}/container_${MATOMO_CONFIG.CONTAINER_ID}.js`;
      
      if (s?.parentNode) {
        s.parentNode.insertBefore(g, s);
      }
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (MATOMO_CONFIG.ENABLE_TRACKING && window._mtm) {
      // Add a small delay to ensure the page has fully loaded
      const timeoutId = setTimeout(() => {
        window._mtm.push({
          'event': 'page_view',
          'page_path': pathname,
          'page_search': searchParams.toString(),
          'page_url': window.location.href
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, searchParams]);

  return children;
}

// Add TypeScript declaration
declare global {
  interface Window {
    _mtm: any[];
  }
} 