import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET;

const authProviders: any[] = [];

if (googleClientId && googleClientSecret) {
  authProviders.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

authProviders.push(
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
        emailVerified: user.emailVerified,
      };
    }
  })
);

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "closecraft_local_dev_auth_secret_key_32chars_long_min",
  providers: authProviders,
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
            include: { memberships: { include: { organization: true } } }
          });

          if (!dbUser) {
            // Auto-provision user + organization on Google Sign-In
            const baseOrgName = user.name ? `${user.name}'s Workspace` : "My Workspace";
            const slug = `${baseOrgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
            
            dbUser = await db.user.create({
              data: {
                email,
                name: user.name || "Sales Lead",
                image: user.image || null,
                memberships: {
                  create: {
                    role: "OWNER",
                    organization: {
                      create: {
                        name: baseOrgName,
                        slug,
                        status: "APPROVED"
                      }
                    }
                  }
                }
              },
              include: {
                memberships: {
                  include: { organization: true }
                }
              }
            });

            // Initialize 14-day trial
            const org = dbUser.memberships[0]?.organization;
            if (org) {
              const trialEndsAt = new Date();
              trialEndsAt.setDate(trialEndsAt.getDate() + 14);

              await db.workspaceSubscription.create({
                data: {
                  organizationId: org.id,
                  status: "TRIALING",
                  plan: "STARTER",
                  pricePerMonth: 20000.0,
                  currency: "NGN",
                  trialEndsAt,
                  maxInternalSeats: 3,
                }
              });
            }
          }

          const primaryOrg = dbUser.memberships[0]?.organization;
          (user as any).id = dbUser.id;
          (user as any).organizationId = primaryOrg?.id || null;
          (user as any).organizationStatus = primaryOrg?.status || "PENDING";
          return true;
        } catch (error: any) {
          console.error("[auth][signIn][google] Database provisioning error:", error);
          const errMsg = error?.message || 'Database error during Google sign in';
          return `/login?error=DatabaseError&details=${encodeURIComponent(errMsg.slice(0, 100))}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as any).organizationId ?? null;
        token.organizationStatus = (user as any).organizationStatus ?? null;
        token.emailVerified = (user as any).emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).emailVerified = token.emailVerified ?? null;
        (session as any).organizationId = typeof token.organizationId === "string" ? token.organizationId : null;
        (session as any).organizationStatus = typeof token.organizationStatus === "string" ? token.organizationStatus : null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
});
