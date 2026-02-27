import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { adminUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // DB 연결 시도
        try {
          if (db) {
            const [user] = await db
              .select()
              .from(adminUsers)
              .where(eq(adminUsers.email, credentials.email as string));

            if (!user) return null;

            const valid = await bcrypt.compare(
              credentials.password as string,
              user.passwordHash
            );
            if (!valid) return null;

            return { id: user.id, email: user.email, name: user.name };
          }
        } catch {
          // DB 연결 실패 시 목업 계정으로 폴백
        }

        // 목업 로그인 (DB 미연결 시)
        if (
          credentials.email === 'admin@ecovision.dev' &&
          credentials.password === 'demo1234'
        ) {
          return { id: 'mock-admin', email: 'admin@ecovision.dev', name: 'Demo Admin' };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
});
