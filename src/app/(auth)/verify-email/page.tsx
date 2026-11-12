'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const affiliateFlow = searchParams.get('flow') === 'affiliate';
  const destination = affiliateFlow ? '/login?callbackUrl=%2Faffiliate%2Fdashboard' : '/onboarding';

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pendingVerificationEmail');
    }
    return null;
  });
  const [emailInput, setEmailInput] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Read URL parameters on mount
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlCode = searchParams.get('code');

    if (urlEmail) {
      setUserEmail(urlEmail);
      try {
        sessionStorage.setItem('pendingVerificationEmail', urlEmail);
      } catch {}
    }

    if (urlCode && urlCode.length === 6) {
      setCode(urlCode);
    }

    // Check verification status via API
    const emailToQuery = urlEmail || (typeof window !== 'undefined' ? sessionStorage.getItem('pendingVerificationEmail') : null);
    const query = emailToQuery ? `?email=${encodeURIComponent(emailToQuery)}` : '';

    fetch(`/api/auth/verify-email${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email && !userEmail) {
          setUserEmail(data.email);
        }
        if (data.verified) {
          router.push(destination);
        }
      })
      .catch(() => {});
  }, [searchParams, router, userEmail, destination]);

  const handleVerify = async (e?: React.FormEvent, explicitCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = explicitCode || code;
    const targetEmail = (userEmail || emailInput).trim().toLowerCase();

    if (!targetEmail) {
      setErrorMessage('Please provide your registered work email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToVerify, email: targetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to verify email. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(affiliateFlow ? 'Email verified successfully! Please sign in to continue.' : 'Email verified successfully! Redirecting to your workspace...');
      try {
        sessionStorage.removeItem('pendingVerificationEmail');
      } catch {}

      setTimeout(() => {
        window.location.href = destination;
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = (userEmail || emailInput).trim().toLowerCase();
    if (!targetEmail) {
      setErrorMessage('Please enter your work email address to receive a verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true, email: targetEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Could not resend code. Please wait a few moments before trying again.');
      } else {
        setSuccessMessage('A fresh 6-digit verification code has been dispatched to your email.');
      }
    } catch {
      setErrorMessage('Network error while requesting a new code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 md:px-8 py-12 min-h-screen justify-center items-center bg-surface">
      <div className="w-full max-w-md mx-auto flex flex-col pt-4">
        
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center group transition-transform hover:scale-105" title="CloseCraft Home">
            <Logo variant="full" size="xl" priority alt="Closecraft" />
          </Link>
        </div>

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors py-1.5 px-3 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Verification Required
          </span>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl p-6 sm:p-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-on-surface mb-2 font-heading">
            Verify Your Email
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
            We sent a 6-digit verification code to {userEmail ? <strong className="text-on-surface">{userEmail}</strong> : 'your registered work email'}. Enter the code below to activate your workspace.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={(e) => handleVerify(e)} className="space-y-4">
            {(!userEmail || isChangingEmail) ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-on-surface">
                    Registered Work Email *
                  </label>
                  {userEmail && (
                    <button
                      type="button"
                      onClick={() => setIsChangingEmail(false)}
                      className="text-xs text-primary hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full text-sm py-2.5 px-3.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant">
                <span>Code sent to: <strong className="text-on-surface">{userEmail}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(userEmail);
                    setIsChangingEmail(true);
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Email & Continue</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-primary hover:underline font-semibold"
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex w-full min-h-screen justify-center items-center bg-surface">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
