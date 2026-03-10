import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@/types/next-auth';

export const authConfig = {
  providers: [
    Credentials({
      async authorize() {
        const user = null as
          | {
              id: string;
              email: string;
              name: string;
              role: UserRole;
            }
          | null;

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      const typedToken = token as {
        id?: string;
        role?: 'RESEARCHER' | 'INSTITUTION_ADMIN' | 'COUNTRY_COORDINATOR' | 'SUPER_ADMIN';
        email?: string;
        name?: string;
      };

      if (session.user) {
        session.user.id = typedToken.id ?? '';
        session.user.email = typedToken.email ?? '';
        session.user.name = typedToken.name ?? '';

        session.user.role = typedToken.role ?? 'RESEARCHER';
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
