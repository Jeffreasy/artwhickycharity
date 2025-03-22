'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { hasAnalyticsConsent } from '@/utils/analytics';
import { Loading } from '@/globalComponents/ui/Loading';

// Helper function for page views
const pageview = (gaId: string, url: string) => {
  if (!window.gtag) return;
  window.gtag('config', gaId, {
    page_path: url,
  });
};

// Component that uses search params
function AnalyticsWithParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';

  useEffect(() => {
    if (!gaId || !window.gtag) return;
    
    // Track page views for SPA navigation
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(gaId, url);
  }, [pathname, searchParams, gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Default to denied until consent is granted
            gtag('consent', 'default', {
              'analytics_storage': 'denied'
            });
            
            // Initial config
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });

            // Check if consent was already given
            if (${JSON.stringify(typeof window !== 'undefined' && hasAnalyticsConsent())}) {
              gtag('consent', 'update', {
                'analytics_storage': 'granted'
              });
            }
          `,
        }}
      />
    </>
  );
}

// Main export with Suspense
export function GoogleAnalyticsScript() {
  return (
    <Suspense fallback={null}>
      <AnalyticsWithParams />
    </Suspense>
  );
} 