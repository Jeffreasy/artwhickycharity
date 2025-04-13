'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // Import the default CSS

// Optional: Customize NProgress CSS here or in a global CSS file
// You can target #nprogress .bar, #nprogress .peg, etc.

export function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false }); // Optional: hide the spinner

    // Start progress bar on mount/navigation start
    NProgress.start();

    // Cleanup function to stop progress bar on unmount/navigation end
    return () => {
      NProgress.done();
    };
  }, [pathname, searchParams]); // Re-run effect when path or search params change

  // This component doesn't render anything itself
  return null;
} 