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
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
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
          include: {
            memberships: {
              include: { organization: true }
            }
          }
        });

        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) return null;

        const primaryOrg = user.memberships[0]?.organization;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: primaryOrg?.id || null,
          organizationStatus: primaryOrg?.status || "PENDING",
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          console.error("[auth][signIn][google] No email returned by Google provider");
          return '/login?error=NoEmail';
        }
        const email = user.email.trim().toLowerCase();
        
        try {
          let dbUser = await db.user.findUnique({
            where: { email },
            include: {
              memberships: {
                include: { organization: true }
              }
            }
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
                status: 'PENDING', // Organizations registered via Google default to PENDING review
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
              include: {
                memberships: {
                  include: { organization: true }
                }
              }
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
                status: 'PENDING',
              }
            });

            const membership = await db.organizationMember.create({
              data: {
                role: 'ADMIN',
                userId: dbUser.id,
                organizationId: org.id
              },
              include: { organization: true }
            });
            dbUser.memberships = [membership];
          }
          
          // Pass db user details to token via user object
          const primaryOrg = dbUser.memberships[0]?.organization;
          user.id = dbUser.id;
          user.organizationId = primaryOrg?.id || null;
          user.organizationStatus = primaryOrg?.status || 'PENDING';
          return true;
        } catch (dbError: unknown) {
          const errMsg = dbError instanceof Error ? dbError.message : String(dbError);
          console.error("[auth][signIn][google] Database error during sign-in:", errMsg);
          return `/login?error=DatabaseError&details=${encodeURIComponent(errMsg.slice(0, 100))}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId ?? null;
        token.organizationStatus = user.organizationStatus ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.organizationId = typeof token.organizationId === "string" ? token.organizationId : null;
        session.organizationStatus = typeof token.organizationStatus === "string" ? token.organizationStatus : null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
});
