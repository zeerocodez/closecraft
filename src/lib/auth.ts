import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { rateLimit } from "./rateLimit";
import bcrypt from "bcryptjs";

function cleanEnv(val?: string): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, '').trim();
  return unquoted || undefined;
}

const googleClientId = cleanEnv(process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID);
const googleClientSecret = cleanEnv(process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET);

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
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) return null;

      let email = (credentials.email as string).trim().toLowerCase();
      // Transparently alias placeholder or operator emails to the seeded demo owner account
      if (email === 'operator@company.com' || email === 'demo@closecrafthq.com') {
        email = 'demo.owner@apexconsulting.ng';
      }

      // Application brute-force safeguard: limit failed attempts per account and IP.
      // Applies to ALL accounts, including demo accounts — no exceptions.
      {
        const accountLimit = await rateLimit(`auth-login-account:${email}`, 10, 15 * 60 * 1000);
        if (!accountLimit.allowed) {
          console.warn(`[auth] Account brute-force limit exceeded for: ${email}`);
          return null;
        }

        const headers = (req as any)?.headers;
        const forwarded = typeof headers?.get === "function" ? headers.get("x-forwarded-for") : (headers?.["x-forwarded-for"] as string | undefined);
        const clientIp = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";
        const ipLimit = await rateLimit(`auth-login-ip:${clientIp}`, 30, 15 * 60 * 1000);
        if (!ipLimit.allowed) {
          console.warn(`[auth] IP brute-force limit exceeded for: ${clientIp}`);
          return null;
        }
      }

      const user = await db.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: { organization: true }
          }
        }
      });

      if (!user || !user.passwordHash) return null;

      // Passwords are verified ONLY against the stored bcrypt hash.
      // Demo accounts are no exception: the seeded demo password works because
      // it is the password hashed in the database, not because of any bypass.
      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.passwordHash
      );

      if (!isPasswordValid) return null;

      const demoOrg = user.memberships.find(m => m.organization.slug === 'apex-demo')?.organization;
      const primaryOrg = demoOrg || user.memberships[0]?.organization;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: primaryOrg?.id || null,
        organizationStatus: primaryOrg?.status || "APPROVED",
        emailVerified: user.emailVerified,
      };
    }
  })
);

const authSecret = cleanEnv(process.env.AUTH_SECRET) ||
  cleanEnv(process.env.NEXTAUTH_SECRET) ||
  // Development-only fallback. In production the app fails closed: a missing
  // secret must stop startup, never silently fall back to a public value.
  (process.env.NODE_ENV !== "production"
    ? "dev-only-insecure-secret-set-AUTH_SECRET-in-production"
    : (() => { throw new Error("[auth] AUTH_SECRET or NEXTAUTH_SECRET must be set in production"); })());

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret: authSecret,
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

            // Initialize 7-day Starter trial (idempotent: does not overwrite existing subscription)
            const org = dbUser.memberships[0]?.organization;
            if (org) {
              const existingSub = await db.workspaceSubscription.findUnique({
                where: { organizationId: org.id }
              });

              if (!existingSub) {
                const { TRIAL_DURATION_MS } = await import('@/lib/payments/subscription');
                const trialStartedAt = new Date();
                const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_MS);

                await db.workspaceSubscription.create({
                  data: {
                    organizationId: org.id,
                    status: "TRIALING",
                    plan: "STARTER",
                    pricePerMonth: 20000.0,
                    currency: "NGN",
                    trialStartedAt,
                    trialEndsAt,
                    maxInternalSeats: 3,
                  }
                });
              }
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
