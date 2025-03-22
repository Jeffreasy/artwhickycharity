import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Deze configuratie kan worden aangepast aan je specifieke behoeften
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Authorizing with credentials:', credentials?.username);
        
        // Check for emergency access first
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          console.log('Credentials match, authorizing user');
          // Return user object that NextAuth will store in the JWT
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@example.com',
            role: 'admin',
            authenticated: true // Add explicit flag
          }
        }
        
        console.log('Invalid credentials');
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login', // Custom login page
    error: '/admin/login', // Redirect to login on error
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - User:', user ? JSON.stringify(user) : 'null', 'Token:', JSON.stringify(token));
      if (user) {
        // Copy all user properties to token
        token.role = user.role;
        token.authenticated = true; // Explicit auth flag
        token.userId = user.id;
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - token:', JSON.stringify(token));
      console.log('Session callback - building session for', session?.user?.name || 'unknown user');
      if (session.user) {
        session.user.role = token.role as string;
        (session.user as any).id = token.userId as string;
        
        // Add authenticated flag
        (session.user as any).authenticated = true;
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 uur
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined // Allow explicit domain setting
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-production',
  debug: true, // Always enable debug mode for now to diagnose issues
  logger: {
    error(code, ...message) {
      console.error(`[NextAuth][Error][${code}]`, ...message)
    },
    warn(code, ...message) {
      console.warn(`[NextAuth][Warning][${code}]`, ...message)
    },
    debug(code, ...message) {
      console.log(`[NextAuth][Debug][${code}]`, ...message)
    }
  }
}

// Use NextAuth handler function directly rather than object
const handler = NextAuth(authOptions)

// Export handler functions for API routes
export { handler as GET, handler as POST } 