import { Roboto_Slab } from 'next/font/google'
import { cn } from '@/utils/cn'
import { Navigation } from '@/globalComponents/ui/Navigation'
import './globals.css'
import { MenuProvider } from '@/contexts/MenuContext'
import { CartProvider } from '@/contexts/CartContext'
import { Footer } from '@/globalComponents/ui/Footer/footer'
import { CartButton } from '@/globalComponents/ui/CartButton'
import { HomeButton } from '@/globalComponents/ui/Homebutton'

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
              <div className="pt-6">
                {children}
              </div>
            </main>
            <HomeButton />
            <Footer />
            <CartButton />
          </CartProvider>
        </MenuProvider>
      </body>
    </html>
  )
}
