import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await db.user.findUnique({
          where: { email },
          include: { memberships: true }
        });

        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.memberships[0]?.organizationId || null
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        const email = user.email.trim().toLowerCase();
        
        let dbUser = await db.user.findUnique({
          where: { email },
          include: { memberships: true }
        });

        if (!dbUser) {
          const baseName = user.name || email.split('@')[0] || 'My';
          const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 25) || 'workspace';
          const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

          const org = await db.organization.create({
            data: {
              name: `${baseName}'s Workspace`,
              slug,
              plan: 'STARTER',
            }
          });

          dbUser = await db.user.create({
            data: {
              email,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              memberships: {
                create: {
                  role: 'ADMIN',
                  organizationId: org.id
                }
              }
            },
            include: { memberships: true }
          });
        } else if (dbUser.memberships.length === 0) {
          const baseName = dbUser.name || email.split('@')[0] || 'My';
          const baseSlug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 25) || 'workspace';
          const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

          const org = await db.organization.create({
            data: {
              name: `${baseName}'s Workspace`,
              slug,
              plan: 'STARTER',
            }
          });

          const membership = await db.organizationMember.create({
            data: {
              role: 'ADMIN',
              userId: dbUser.id,
              organizationId: org.id
            }
          });
          dbUser.memberships = [membership];
        }
        
        // Pass db user details to token via user object
        user.id = dbUser.id;
        (user as any).organizationId = dbUser.memberships[0]?.organizationId || null;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as any).organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session as any).organizationId = typeof token.organizationId === "string" ? token.organizationId : null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
});
