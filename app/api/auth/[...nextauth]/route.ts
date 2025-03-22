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
        
        // Hardcoded credentials - in productie zou je deze vervangen door veilige authenticatie
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          console.log('Credentials match, authorizing user');
          return {
            id: '1',
            name: 'Admin',
            email: 'admin@example.com',
            role: 'admin'
          }
        }
        
        console.log('Invalid credentials');
        return null
      }
    })
  ],
  pages: {
    signIn: '/admin/login', // Custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - User:', user ? 'exists' : 'null', 'Token:', token.name || 'no name');
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - building session for', session?.user?.name || 'unknown user');
      if (session.user) {
        session.user.role = token.role as string
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
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_COOKIE_SECURE === 'false' ? false : true,
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined // Allow explicit domain setting
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_COOKIE_SECURE === 'false' ? false : true,
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_COOKIE_SECURE === 'false' ? false : true,
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