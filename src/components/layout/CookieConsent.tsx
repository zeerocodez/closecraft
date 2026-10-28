'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Check, X, SlidersHorizontal } from 'lucide-react';

export interface CookiePreferences {
  essential: true; // Always true
  referralAnalytics: boolean;
  timestamp: string;
  version: string;
}

const COOKIE_CONSENT_KEY = 'closecraft_cookie_consent';
const CURRENT_VERSION = '2026.1';

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [referralAnalytics, setReferralAnalytics] = useState(false);

  useEffect(() => {
    // Check if consent has been recorded
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!stored) {
        setIsOpen(true);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        if (parsed.version !== CURRENT_VERSION) {
          setIsOpen(true);
        } else {
          setReferralAnalytics(parsed.referralAnalytics);
        }
      }
    } catch (e) {
      setIsOpen(true);
    }

    // Listener to re-open preferences anytime from footer or policy pages
    const handleReopen = () => {
      setShowManageModal(true);
    };

    window.addEventListener('closecraft-reopen-consent', handleReopen);
    return () => window.removeEventListener('closecraft-reopen-consent', handleReopen);
  }, []);

  const saveConsent = (allowOptional: boolean) => {
    const prefs: CookiePreferences = {
      essential: true,
      referralAnalytics: allowOptional,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION
    };

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    } catch (e) {
      // Ignore localStorage quotas
    }

    setReferralAnalytics(allowOptional);
    setIsOpen(false);
    setShowManageModal(false);

    if (!allowOptional) {
      // Clear optional referral tracking cookies
      document.cookie = 'dss_visitor=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    }
  };

  if (!isOpen && !showManageModal) return null;

  return (
    <>
      {/* 1. Main Cookie Banner */}
      {isOpen && !showManageModal && (
        <div
          role="dialog"
          aria-label="Cookie and Tracking Preferences"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 p-5 rounded-2xl bg-[#0B1117]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-white text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-[#248277]/20 text-[#45bfae] shrink-0 mt-0.5">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white mb-1">Your Privacy &amp; Tracking Choices</h2>
              <p className="text-gray-300 text-xs leading-relaxed">
                We use strictly necessary cookies for authentication and workspace security. We only use optional referral tracking with your explicit consent. No cross-site advertising trackers are deployed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            <Link href="/cookies" className="text-[#45bfae] hover:underline font-medium">
              Cookie Notice &rarr;
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManageModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-semibold transition-colors"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => saveConsent(false)}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={() => saveConsent(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs font-bold transition-all shadow-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Preferences Modal */}
      {showManageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-manage-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-2xl bg-[#0B1117] border border-white/15 p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#45bfae]" />
                <h2 id="cookie-manage-title" className="text-base font-bold">
                  Manage Cookie Preferences
                </h2>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                aria-label="Close preferences"
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Category 1: Essential */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Strictly Necessary Storage</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">REQUIRED</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Essential for secure authentication, CSRF tokens, and workspace session persistence. Cannot be disabled.
                  </p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <span className="text-xs text-gray-400 font-bold">Always Active</span>
                </div>
              </div>

              {/* Category 2: Optional Referral Tracking */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Referral &amp; Affiliate Attribution</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#45bfae]/20 text-[#45bfae] font-mono">OPTIONAL</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Uses the <code className="text-[#45bfae]">dss_visitor</code> cookie (30 days) to accurately credit student referrals from verified partner links.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={referralAnalytics}
                      onChange={(e) => setReferralAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#248277]"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
              <Link href="/cookies" className="text-[#45bfae] hover:underline">
                View Full Storage Inventory
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveConsent(false)}
                  className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white font-semibold transition-colors"
                >
                  Reject All Optional
                </button>
                <button
                  type="button"
                  onClick={() => saveConsent(referralAnalytics)}
                  className="px-4 py-2 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white font-bold transition-all shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
