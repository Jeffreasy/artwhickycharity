import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  
  // Alleen middleware toepassen op admin routes, behalve de login pagina
  if (pathname.startsWith('/admin') && !pathname.includes('/admin/login')) {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    
    // Als er geen sessie is, omleiden naar login pagina
    if (!session) {
      const url = new URL('/admin/login', req.url)
      return NextResponse.redirect(url)
    }
  }
  
  return res
}

export const config = {
  // Alleen toepassen op admin routes
  matcher: '/admin/:path*',
} 