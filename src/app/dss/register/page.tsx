import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo, DSSLogo } from '@/components/ui/Logo';

export default function DSSRegisterPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container p-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface">
            <Logo variant="icon" size="xs" />
            <span>&larr; Back to Home</span>
          </Link>
          <Link href="/dss" className="text-xs font-bold text-primary hover:underline">
            DSS Academy &rarr;
          </Link>
        </div>
        <div className="flex justify-center mb-6">
          <DSSLogo variant="full" size="xl" alt="Digital Sales School" />
        </div>
        <p className="text-on-surface-variant text-center mb-8 font-body-md">
          Create your account to access the AI-powered LMS, training routes, and certifications.
        </p>

        <form className="space-y-4" action="/dss/dashboard">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              placeholder="e.g. Alex Rivera"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              placeholder="alex@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Training Route / Track</label>
            <select 
              name="track"
              defaultValue="dss-both-routes"
              className="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all text-sm"
            >
              <option value="dss-setters-route">Setters Route (₦100,000 / $100)</option>
              <option value="dss-closers-route">Closers Route (₦100,000 / $100)</option>
              <option value="dss-live-roleplay-internship">Live Role Plays & Internship (₦100,000 / $100)</option>
              <option value="dss-both-routes">Both Routes Bundle (₦150,000 / $150 - Save ₦50k/$50)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full mt-6 py-3 px-4 bg-primary text-on-primary rounded-xl font-bold font-label-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm">
            Create Account & Enter Portal <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
