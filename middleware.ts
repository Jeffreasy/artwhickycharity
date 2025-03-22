import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Deze middleware vangt alle requests af en zorgt dat admin pagina's beveiligd zijn
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname
  
  console.log("Middleware accessing path:", path);
  
  // Als het geen admin pad is, hoeven we niks te doen
  if (!path.startsWith('/admin') || path === '/admin/login') {
    return response
  }

  console.log("Checking auth for admin path:", path);
  
  // Probeer eerst NextAuth token te krijgen
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-production'
  })
  
  if (token) {
    console.log("NextAuth token found:", token);
    return response;
  }

  console.log("No NextAuth token, checking Supabase session");
  
  // Als er geen NextAuth sessie is, probeer we Supabase sessie te controleren
  // Initialiseer de Supabase client met de request/response
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  // Controleer of er een geldige sessie is
  const { data: { session } } = await supabase.auth.getSession()
  
  // Als er een geldige sessie is, laat door
  if (session) {
    console.log("Supabase session found");
    return response;
  }
  
  console.log("No valid session found, redirecting to login");
  
  // Geen geldige sessie gevonden, stuur door naar login
  const redirectUrl = new URL('/admin/login', request.url)
  // Sla huidige URL op als callbackUrl voor na login
  redirectUrl.searchParams.set('callbackUrl', request.url)
  
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    // Bescherm alle admin routes behalve login
    '/admin/:path*',
  ],
} 