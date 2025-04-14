import { Roboto_Slab } from 'next/font/google'
import { cn } from '@/utils/cn'
import { Navigation } from '@/globalComponents/ui/Navigation'
import './globals.css'
import { MenuProvider } from '@/contexts/MenuContext'
import { CartProvider } from '@/contexts/CartContext'
import { Footer } from '@/globalComponents/ui/Footer/footer'
import { CartButton } from '@/globalComponents/ui/CartButton'
import { HomeButton } from '@/globalComponents/ui/Homebutton'
import { Analytics } from '@vercel/analytics/react'
import { AdminButton } from '@/globalComponents/ui/Adminbutton'
import { PageLoader } from '@/globalComponents/ui/PageLoader'
import Script from 'next/script'
import React, { Suspense } from 'react'

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-slab',
})

export const metadata = {
  title: 'Whisky4Charity',
  description: 'Whisky for a good cause',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="nl" className="h-full">
      <body 
        className={cn(
          robotoSlab.variable,
          'h-full',
          'bg-black',
          'text-white',
          'antialiased',
          'font-sans'
        )}
      >
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <MenuProvider>
          <CartProvider>
            <Navigation />
            <main>
              <div className="pt-6">
                {children}
              </div>
            </main>
            <HomeButton />
            <Footer />
            <CartButton />
          </CartProvider>
        </MenuProvider>
        <AdminButton />
        <Analytics />

        {/* Google Analytics Scripts - Only render if GA_ID is set */}
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics-config"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
