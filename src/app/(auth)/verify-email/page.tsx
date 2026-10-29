'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
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

  const handleVerify = async (e?: React.FormEvent, isQuick = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isQuick ? { quickVerify: true } : { code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to verify email. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Email verified successfully! Redirecting to workspace onboarding...');
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Could not resend code.');
      } else {
        setSuccessMessage('A fresh 6-digit code has been sent to your email.');
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
            We sent a 6-digit verification code to {userEmail ? <strong>{userEmail}</strong> : 'your registered email'}. Enter the code below to activate your workspace.
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

          <form onSubmit={(e) => handleVerify(e, false)} className="space-y-4">
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

          {/* Quick Verify for Testing/Dev */}
          <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleVerify(undefined, true)}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors border border-outline-variant/30 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
              <span>Quick Verify (Development/Testing)</span>
            </button>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2">
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
    </div>
  );
}
