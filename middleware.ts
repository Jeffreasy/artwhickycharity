import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Deze middleware vangt alle requests af en zorgt dat admin pagina's beveiligd zijn
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const path = request.nextUrl.pathname
  const requestId = Math.random().toString(36).substring(2, 10) // Generate unique ID for request tracing
  
  console.log(`[${requestId}] ⚡ Middleware accessing path: ${path}`);
  
  // Als het geen admin pad is, hoeven we niks te doen
  if (!path.startsWith('/admin')) {
    console.log(`[${requestId}] 🔄 Non-admin path, skipping auth check`);
    return response;
  }
  
  // Always allow login and register pages
  if (path === '/admin/login' || path === '/admin/register') {
    console.log(`[${requestId}] 🔓 Auth page access (${path}), skipping auth check`);
    return response;
  }

  console.log(`[${requestId}] 🔐 Checking auth for protected admin path: ${path}`);
  
  // Log all cookies for debugging purposes
  const allCookies = request.cookies.getAll();
  console.log(`[${requestId}] 🍪 Cookies found:`, allCookies.map(c => `${c.name}=${c.value.substring(0, 10)}...`));
  
  // Check for admin bypass cookie (emergency access)
  const adminBypass = request.cookies.get('admin_bypass')
  if (adminBypass && adminBypass.value === 'true') {
    console.log(`[${requestId}] 🚨 Admin bypass cookie found, EMERGENCY ACCESS GRANTED`);
    return response;
  }
  
  // Check Supabase session
  try {
    // Initialiseer de Supabase client met de request/response
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    // Controleer of er een geldige sessie is
    const { data: { session } } = await supabase.auth.getSession()
    
    // Als er een geldige sessie is, laat door
    if (session) {
      console.log(`[${requestId}] ✅ Supabase session found for user: ${session.user.email}, allowing access`);
      return response;
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Error retrieving Supabase session:`, error);
  }
  
  console.log(`[${requestId}] 🚫 No valid session found, redirecting to login`);
  
  // Geen geldige sessie gevonden, stuur door naar login
  const redirectUrl = new URL('/admin/login', request.url)
  // Sla huidige URL op als callbackUrl voor na login
  redirectUrl.searchParams.set('callbackUrl', request.url)
  
  console.log(`[${requestId}] 🔄 Redirecting to: ${redirectUrl.toString()}`);
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    // Bescherm alle admin routes behalve login
    '/admin/:path*',
  ],
} 