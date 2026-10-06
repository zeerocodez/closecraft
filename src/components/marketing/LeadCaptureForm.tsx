'use client';

import { useState } from 'react';

export default function LeadCaptureForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call for lead creation
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-xl shadow-xl text-center border border-surface-container">
        <span className="material-symbols-outlined text-[48px] text-primary mb-4">check_circle</span>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">Application Received</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Our AI qualification engine is reviewing your details. We will be in touch shortly with your next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-surface-container-high relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[24px]">contact_mail</span>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Become a Closer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="firstName">First Name</label>
              <input 
                className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all" 
                id="firstName" 
                placeholder="Sarah" 
                required 
                type="text"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="lastName">Last Name</label>
              <input 
                className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all" 
                id="lastName" 
                placeholder="Jenkins" 
                required 
                type="text"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
            <input 
              className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all" 
              id="email" 
              placeholder="sarah@example.com" 
              required 
              type="email"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="experience">Sales Experience</label>
            <select 
              className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all cursor-pointer" 
              id="experience"
              required
            >
              <option value="" disabled selected>Select experience level</option>
              <option value="none">No prior experience (Willing to learn)</option>
              <option value="beginner">1-2 years (SDR / BDR)</option>
              <option value="intermediate">3-5 years (Account Executive)</option>
              <option value="expert">5+ years (Senior Closer / VP)</option>
            </select>
          </div>

          <button 
            className={`w-full h-12 rounded ${isSubmitting ? 'bg-primary-container opacity-80 pointer-events-none' : 'bg-primary hover:bg-primary-container active:scale-[0.99]'} text-on-primary font-headline-sm text-headline-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all mt-6`}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Apply to Network</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-secondary">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span className="font-body-sm text-[11px] uppercase tracking-wider font-bold">Secure SSL Application</span>
        </div>
      </div>
    </div>
  );
}
