import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Deze middleware vangt alle requests af en zorgt dat admin pagina's beveiligd zijn
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname
  
  // Als het geen admin pad is, hoeven we niks te doen
  if (!path.startsWith('/admin') || path === '/admin/login') {
    return response
  }

  // Probeer eerst NextAuth token te krijgen
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Als er geen NextAuth sessie is, probeer we Supabase sessie te controleren
  if (!token) {
    // Initialiseer de Supabase client met de request/response
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Controleer of er een geldige sessie is
    const { data: { session } } = await supabase.auth.getSession()
    
    // Als er geen sessie is, stuur dan door naar login
    if (!session) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Bescherm alle admin routes behalve login
    '/admin/:path*',
  ],
} 