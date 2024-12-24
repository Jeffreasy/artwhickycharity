import { Roboto_Slab } from 'next/font/google'
import { cn } from '@/utils/cn'
import { Navigation } from '@/globalComponents/ui/Navigation'
import { LanguageBar } from '@/app/home/components/LanguageBar'
import './globals.css'
import { MenuProvider } from '@/contexts/MenuContext'
import { Footer } from '@/globalComponents/ui/Footer/footer'
import { MenuBar } from '@/globalComponents/ui/MenuBar'
import { FullscreenMenu } from '@/globalComponents/ui/FullscreenMenu'

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
          <Navigation />
          <LanguageBar />
          {children}
          <Footer />
        </MenuProvider>
      </body>
    </html>
  )
}
