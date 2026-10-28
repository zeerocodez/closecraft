'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

interface AcceptInviteFormProps {
  token: string;
  email: string;
  role: string;
  organizationName: string;
  isLoggedIn: boolean;
  currentUserEmail: string | null;
}

export default function AcceptInviteForm({
  token,
  email,
  role,
  organizationName,
  isLoggedIn,
  currentUserEmail,
}: AcceptInviteFormProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRoleCloserOrSetter = role === 'CLOSER' || role === 'SETTER' || role === 'EXTERNAL_PROFESSIONAL';
  const targetDestination = isRoleCloserOrSetter ? '/rep' : '/today';

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim() || undefined,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to accept invitation.');
        setIsLoading(false);
        return;
      }

      // If not logged in, sign in using credentials now
      if (!isLoggedIn && password) {
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          window.location.href = `/login?accepted=true&email=${encodeURIComponent(email)}`;
          return;
        }
      }

      // Redirect directly to destination without repeating qualification or creating another workspace
      window.location.href = targetDestination;
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error accepting invitation.');
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <form onSubmit={handleAccept} className="space-y-4">
        <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant">
          Logged in as <strong>{currentUserEmail}</strong>. Accepting will link your existing account to <strong>{organizationName}</strong>.
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Accept & Enter {organizationName}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleAccept} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1">
          Invited Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-surface-variant border border-outline-variant/30 text-xs font-mono opacity-80 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1">
          Your Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Samuel Adekunle"
          required
          className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-on-surface mb-1">
          Create Password (min 8 characters)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="w-full py-2.5 px-3 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || password.length < 8}
        className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Join Workspace</span>
            <span className="material-symbols-outlined text-[16px]">check</span>
          </>
        )}
      </button>
    </form>
  );
}
