import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'

/**
 * Configuración AUTH separada para el middleware (Edge Runtime).
 * NO importa Prisma ni bcrypt — esos son Node.js only.
 * La autorización real ocurre en el handler de la API (/api/auth/...).
 */
export const { auth: middleware } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      // authorize vacío aquí — se maneja en auth.ts (Node.js)
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.organizationId = (user as any).organizationId
        token.roles = (user as any).roles
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).roles = token.roles
      }
      return session
    },
  },
})
