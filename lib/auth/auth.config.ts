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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;

        session.user.role = (token.role ?? 'RESEARCHER') as
          | 'RESEARCHER'
          | 'INSTITUTION_ADMIN'
          | 'COUNTRY_COORDINATOR'
          | 'SUPER_ADMIN';
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
