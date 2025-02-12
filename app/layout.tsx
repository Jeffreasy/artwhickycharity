import { Roboto_Slab } from 'next/font/google'
import { cn } from '@/utils/cn'
import { Navigation } from '@/globalComponents/ui/Navigation'
import './globals.css'
import { MenuProvider } from '@/contexts/MenuContext'
import { CartProvider } from '@/contexts/CartContext'
import { Footer } from '@/globalComponents/ui/Footer/footer'
import { LanguageBar } from '@/app/home/components/LanguageBar'
import { getLanguagePhrases } from '@/app/home/lib/language-bar'
import { Suspense } from 'react'
import { CartButton } from '@/globalComponents/ui/CartButton'

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto-slab',
})

export const metadata = {
  title: 'Whisky4Charity',
  description: 'Whisky for a good cause',
}

// Aparte async component voor het laden van de LanguageBar
async function LanguageBarWithData() {
  try {
    const phrases = await getLanguagePhrases()
    return <LanguageBar initialPhrases={phrases} />
  } catch (error) {
    console.error('Error loading language phrases:', error)
    return null
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <MenuProvider>
          <CartProvider>
            <Navigation />
            <main>
              <div className="pt-[120px]">
                <Suspense 
                  fallback={
                    <div className="h-[52px] flex items-center justify-center">
                      <span className="text-white/50">Loading...</span>
                    </div>
                  }
                >
                  <LanguageBarWithData />
                </Suspense>
              </div>
              <div className="pt-6">
                {children}
              </div>
            </main>
            <Footer />
            <CartButton />
          </CartProvider>
        </MenuProvider>
      </body>
    </html>
  )
}
