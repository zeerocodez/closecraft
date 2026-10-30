'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Logo from '@/components/ui/Logo';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string)?.trim();
    const companyName = (formData.get('companyName') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const whatsappNumber = (formData.get('whatsappNumber') as string)?.trim();
    const password = formData.get('password') as string;

    if (!name || !companyName || !email || !whatsappNumber || !password) {
      setErrorMessage('Please fill in all required fields, including your WhatsApp number.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, companyName, email, whatsappNumber, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create workspace. Please try again.');
        setIsLoading(false);
        return;
      }

      try {
        sessionStorage.setItem('pendingVerificationEmail', email);
      } catch {}

      // Automatically sign in the new user
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        // Fallback to login page with success notification
        window.location.href = '/login?registered=true';
      } else {
        window.location.href = '/verify-email';
      }
    } catch (err: any) {
      setErrorMessage('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 pb-12 pt-8 min-h-screen justify-center items-center bg-surface">
      <div className="w-full max-w-md mx-auto flex flex-col pt-4">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1.5 px-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <Link 
            href="/dss" 
            className="inline-flex items-center gap-1 text-xs font-bold text-[#45bfae] hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>DSS Academy &rarr;</span>
          </Link>
        </div>

        {/* 7-Day Free Trial Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container mb-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold uppercase text-primary tracking-wider">7-DAY FREE TRIAL</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">credit_card_off</span>
            <span className="text-xs font-semibold uppercase">No Card Required</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="mb-4 inline-flex items-center group transition-transform hover:scale-105" title="CloseCraft Home">
            <Logo variant="full" size="xl" priority alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest text-[10px]">
              7-DAY FREE TRIAL
            </span>
          </div>
          <h1 className="font-headline-xl text-2xl md:text-3xl text-on-surface font-bold tracking-tight mb-2">
            Put your follow-up in one workspace.
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-sm leading-relaxed">
            Create your Closecraft workspace and start organising the enquiries you already have. Your seven-day Starter trial begins when your workspace is ready.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="relative w-full rounded-xl bg-surface-container-lowest shadow-xl p-6 mb-6 overflow-hidden border border-surface-container">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase text-primary tracking-wider">Workspace Setup</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">credit_card_off</span> No CC Required
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface" htmlFor="name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">person</span>
                <input
                  className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                  id="name"
                  name="name"
                  placeholder="e.g. Sarah Jenkins"
                  required
                  type="text"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Business Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface" htmlFor="companyName">
                Business Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">domain</span>
                <input
                  className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                  id="companyName"
                  name="companyName"
                  placeholder="e.g. Acme Operations"
                  required
                  type="text"
                  autoComplete="organization"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface" htmlFor="email">
                Work Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">mail</span>
                <input
                  className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                  id="email"
                  name="email"
                  placeholder="sarah@example.com"
                  required
                  type="email"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Phone / WhatsApp */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-on-surface" htmlFor="whatsappNumber">
                Phone / WhatsApp
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">chat</span>
                <input
                  className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all font-mono"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder="e.g. 0810 326 2248 or +234..."
                  required
                  type="tel"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-on-surface" htmlFor="password">
                  Password
                </label>
                <span className="font-semibold text-[10px] text-secondary tracking-normal">Min 8 chars</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">key</span>
                <input
                  className="w-full h-11 pl-10 pr-11 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-1 w-9 h-9 flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms of Service & Privacy Notice checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input 
                  className="w-4 h-4 mt-0.5 rounded bg-surface-container-high text-primary focus:ring-0 focus:outline-none cursor-pointer" 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  required 
                />
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline font-semibold">Terms of Service</Link> and have read the <Link href="/privacy" target="_blank" className="text-primary hover:underline font-semibold">Privacy Notice</Link>.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input 
                  className="w-4 h-4 mt-0.5 rounded bg-surface-container-high text-primary focus:ring-0 focus:outline-none cursor-pointer" 
                  id="marketingConsent" 
                  name="marketingConsent" 
                  type="checkbox" 
                />
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  I agree to receive occasional Closecraft product updates and follow-up playbooks (optional).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className={`w-full h-12 rounded ${isLoading ? 'bg-primary-container opacity-80 pointer-events-none' : 'bg-primary hover:bg-primary-container active:scale-[0.99]'} text-on-primary font-medium text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all mt-4`}
              type="submit"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create My Trial Workspace</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>

            {/* Supporting Line */}
            <p className="text-xs text-center text-on-surface-variant pt-1">
              No credit card required. No automatic charge when your trial ends.
            </p>
          </form>

          {/* Social Separator */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full h-px bg-surface-container-high"></div>
            <span className="absolute px-3 bg-surface-container-lowest text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              or continue with Google
            </span>
          </div>

          {/* Google Sign-in */}
          <div className="grid grid-cols-1 gap-3">
            <button
              className="w-full h-11 px-4 rounded bg-surface-container hover:bg-surface-container-high active:scale-[0.99] flex items-center justify-center gap-3 transition-colors text-on-surface text-sm font-medium shadow-sm"
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>

        {/* Existing Account Link */}
        <div className="rounded-xl bg-surface-container-high p-4 flex items-center justify-between mb-8 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-inverse-surface flex items-center justify-center text-primary-fixed shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm font-semibold text-on-surface truncate">Already have an account?</span>
              <span className="text-sm text-on-surface-variant truncate">Sign in to your workspace</span>
            </div>
          </div>
          <Link href="/login" className="shrink-0 px-4 py-2 rounded bg-inverse-surface text-inverse-on-primary hover:bg-on-surface transition-colors text-sm font-medium font-semibold ml-2">
            Sign in
          </Link>
        </div>

        {/* Security Footer */}
        <div className="flex flex-col items-center justify-center gap-2 text-center px-3">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary">security</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Security Protocol</span>
          </div>
          <p className="text-sm text-secondary">
            SOC2 Type II Certified • 256-Bit NDPR & GDPR Compliant Multi-Tenant Isolation
          </p>
        </div>

      </div>
    </div>
  );
}
