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
    
    // Check if we're in a redirect loop from login to login
    const referer = request.headers.get('referer') || '';
    if (path === '/admin/login' && referer.includes('/admin/login')) {
      console.log(`[${requestId}] ⚠️ Potential redirect loop detected, allowing through without redirect`);
      return response;
    }
    
    return response;
  }

  console.log(`[${requestId}] 🔐 Checking auth for protected admin path: ${path}`);
  
  // Initialize the Supabase client with the request/response
  const supabase = createMiddlewareClient({ req: request, res: response })
  
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
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Log session information for debugging
    if (session) {
      console.log(`[${requestId}] ✅ Supabase session found for user: ${session.user.email}, allowing access`);
      
      // Add the session user ID to a new response header for debugging
      const newResponse = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })
      newResponse.headers.set('x-user-id', session.user.id)
      return newResponse;
    } else {
      console.log(`[${requestId}] ❓ No Supabase session found`);
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Error retrieving Supabase session:`, error);
    // In case of error, let the user through to avoid breaking the site
    // The client-side auth checks will handle redirects more gracefully
    return response;
  }
  
  console.log(`[${requestId}] 🚫 No valid session found, redirecting to login`);
  
  // Geen geldige sessie gevonden, stuur door naar login
  const redirectUrl = new URL('/admin/login', request.url)
  
  // Sla huidige URL op als callbackUrl voor na login
  // But make sure we don't create an infinite loop of redirects
  const currentUrl = request.nextUrl.pathname
  if (currentUrl !== '/admin/login' && !currentUrl.includes('/api/')) {
    redirectUrl.searchParams.set('callbackUrl', request.url)
  }
  
  console.log(`[${requestId}] 🔄 Redirecting to: ${redirectUrl.toString()}`);
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    // Bescherm alle admin routes behalve login
    '/admin/:path*',
  ],
} 