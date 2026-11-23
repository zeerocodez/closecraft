'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Field';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Rocket,
} from 'lucide-react';

function AuthStatusBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const details = searchParams.get('details');
  const registered = searchParams.get('registered');

  if (error === 'Configuration') {
    return (
      <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-200">Single Sign-On Notice</p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Google SSO is registered for production domains. For local evaluation, please use the <strong>1-Click Sign In</strong> button below to access the Apex Professional Services workspace.
          </p>
        </div>
      </div>
    );
  }

  if (error === 'DatabaseError') {
    return (
      <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-left flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-red-200">Database Connection Error</p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Unable to reach the workspace database. Please check your network connection and try again in a few moments.
          </p>
          {details && (
            <p className="text-red-300 font-mono text-[10px] bg-red-900/40 p-1.5 rounded break-all mt-1">
              Details: {details}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error === 'AccessDenied') {
    return (
      <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-amber-200">Access Denied During Sign-in</p>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Your sign-in request could not be authorized. Please verify your workspace membership permissions or sign in with your email and password.
          </p>
        </div>
      </div>
    );
  }

  if (error === 'NoEmail') {
    return (
      <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
        <Mail className="w-4 h-4 text-red-400 shrink-0" />
        <span>Google did not provide an email address. Please allow email access on your account.</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span>Authentication failed. Please verify your credentials or register a new workspace.</span>
      </div>
    );
  }

  if (registered === 'true') {
    return (
      <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Workspace created successfully! Please sign in with your credentials.</span>
      </div>
    );
  }

  return null;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
    });

    if (res?.error) {
      setFormError('Invalid email or password. Please verify your credentials or register a new workspace.');
      setIsLoading(false);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const callback = searchParams.get('callbackUrl') || '/dashboard';
      window.location.href = callback;
    }
  };

  const handleDirectDemoSignIn = async () => {
    setEmail('demo.owner@apexconsulting.ng');
    setPassword('DemoAccess2026!');
    setIsLoading(true);
    setFormError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email: 'demo.owner@apexconsulting.ng',
      password: 'DemoAccess2026!',
    });

    if (res?.error) {
      setFormError('Demo access error. Please try again.');
      setIsLoading(false);
    } else {
      const searchParams = new URLSearchParams(window.location.search);
      const callback = searchParams.get('callbackUrl') || '/dashboard';
      window.location.href = callback;
    }
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 pb-12 pt-8 min-h-screen justify-center items-center bg-surface">
      <div className="w-full max-w-md mx-auto flex flex-col pt-4">
        {/* Top Header Links */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1.5 px-3 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dss"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45bfae] hover:underline"
          >
            <GraduationCap className="w-4 h-4" />
            <span>DSS Academy &rarr;</span>
          </Link>
        </div>

        {/* Enterprise Security Pill */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-container mb-6 shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider">
              Workspace Access
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Encrypted</span>
          </div>
        </div>

        {/* Brand Headline */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="mb-4 inline-flex items-center group transition-transform hover:scale-105" title="CloseCraft Home">
            <Logo variant="full" size="xl" priority alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-fixed text-xs font-semibold uppercase tracking-widest text-[10px] border border-primary/30">
              REVENUE OS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
            Turn More Leads Into Sales.
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xs leading-relaxed">
            AI qualifies, follows up and routes opportunities. Your sales team closes.
          </p>
        </div>

        {/* Login Card */}
        <div className="relative w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl p-6 sm:p-7 mb-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-fixed to-emerald-400" />

          <Suspense fallback={null}>
            <AuthStatusBanner />
          </Suspense>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Quick Evaluator Access Pill */}
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Startup Challenge Evaluator?
              </p>
              <p className="text-[11px] text-slate-300">
                1-click demo access to Apex Professional Services
              </p>
            </div>
            <button
              type="button"
              onClick={handleDirectDemoSignIn}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-[#C7F36B] hover:bg-[#d9f99d] text-[#111827] font-extrabold text-xs shrink-0 transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : '1-Click Sign In →'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider">
              Sign In to Account
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-surface-container-high text-on-surface-variant text-xs font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-primary" /> Secure
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Field label="Work Email" required>
              <Input
                id="work-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo.owner@apexconsulting.ng"
                required
                type="email"
                autoFocus
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </Field>

            <Field label="Password" required>
              <div className="relative flex items-center">
                <Input
                  id="password-input"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Key className="w-4 h-4" />}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  className="w-4 h-4 rounded bg-surface-container-high text-primary focus:ring-0 focus:outline-none cursor-pointer"
                  id="remember-device"
                  type="checkbox"
                />
                <span className="text-xs text-on-surface-variant">Remember this device</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary-fixed hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Alternative Provider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full h-px bg-outline-variant/30" />
            <span className="absolute px-3 bg-surface-container-lowest text-on-surface-variant/80 text-[11px] font-semibold uppercase tracking-wider">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              className="w-full h-11 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-high/60 hover:bg-surface-container-high active:scale-[0.99] flex items-center justify-center gap-3 transition-colors text-on-surface text-xs font-semibold shadow-sm"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google Workspace</span>
            </button>
          </div>
        </div>

        {/* Free Trial Banner */}
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-high/40 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-fixed shrink-0">
              <Rocket className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-on-surface truncate">New to Closecraft?</span>
              <span className="text-xs text-on-surface-variant truncate">7-day Starter trial, no card required</span>
            </div>
          </div>
          <Link
            href="/signup"
            className="shrink-0 px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-[#5cd4c3] transition-colors text-xs font-bold shadow-sm"
          >
            Start Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
