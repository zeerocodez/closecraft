'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setIsLoading(true);
 
 const formData = new FormData(e.currentTarget);
 const email = formData.get('email') as string;
 const password = formData.get('password') as string;

 const res = await signIn('credentials', {
 redirect: false,
 email,
 password,
 });

 if (res?.error) {
 alert("Invalid credentials. In development, you can use google auth if you setup the keys, or create a user in the database first.");
 setIsLoading(false);
 } else {
 window.location.href = '/dashboard';
 }
 };

 return (
 <div className="flex flex-col w-full px-4 md:px-8 pb-8 pt-8 min-h-screen justify-center items-center bg-surface">
 <div className="w-full max-w-md mx-auto flex flex-col pt-4">
 <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container mb-6 shadow-sm">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
 <span className="text-xs font-semibold uppercase text-on-surface-variant uppercase tracking-wider">Enterprise Gateway</span>
 </div>
 <div className="flex items-center gap-1 text-primary">
 <span className="material-symbols-outlined text-[16px]">verified_user</span>
 <span className="text-xs font-semibold uppercase">v4.18 Secure</span>
 </div>
 </div>

 <div className="flex flex-col items-center text-center mb-6">
 <div className="relative w-16 h-16 rounded-xl bg-inverse-surface shadow-md flex items-center justify-center mb-3 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent"></div>
 {/* Replace with actual logo if available */}
 <span className="material-symbols-outlined text-[32px] text-primary-fixed z-10">rocket_launch</span>
 </div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-medium text-sm font-bold text-on-surface tracking-tight">CLOSECRAFT</span>
 <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest text-[10px]">REVENUE OS</span>
 </div>
 <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-2">
 Turn More Leads Into Sales.
 </h1>
 <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">
 AI qualifies, follows up and routes opportunities. Your sales team closes.
 </p>
 </div>

 <div className="relative w-full rounded-xl bg-surface-container-lowest shadow-xl p-6 mb-6 overflow-hidden">
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>
 
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-semibold uppercase uppercase text-secondary tracking-wider">Operator Authentication</span>
 <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-sm font-medium flex items-center gap-1">
 <span className="material-symbols-outlined text-[14px] text-primary">lock</span> Encrypted
 </span>
 </div>

 <form className="space-y-4" onSubmit={handleLogin}>
 <div className="space-y-1">
 <label className="block text-sm font-medium text-on-surface" htmlFor="work-email">Work Email</label>
 <div className="relative flex items-center">
 <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">mail</span>
 <input 
 className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" 
 id="work-email" 
 name="email"
 placeholder="sarah.jenkins@acmeops.com" 
 required 
 type="email"
 />
 </div>
 </div>
 
 <div className="space-y-1">
 <div className="flex items-center justify-between">
 <label className="block text-sm font-medium text-on-surface" htmlFor="password-input">Master Password</label>
 <span className="font-semibold text-[10px] text-secondary tracking-normal">AES-256</span>
 </div>
 <div className="relative flex items-center">
 <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">key</span>
 <input 
 className="w-full h-11 pl-10 pr-11 rounded bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" 
 id="password-input"
 name="password"
 placeholder="••••••••••••" 
 required 
 type={showPassword ? "text" : "password"}
 />
 <button 
 aria-label="Toggle password visibility" 
 className="absolute right-1 w-9 h-9 flex items-center justify-center text-secondary hover:text-on-surface transition-colors" 
 onClick={() => setShowPassword(!showPassword)}
 type="button"
 >
 <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
 </button>
 </div>
 </div>

 <div className="flex items-center justify-between pt-1">
 <label className="flex items-center gap-2 cursor-pointer select-none">
 <input className="w-4 h-4 rounded bg-surface-container-high text-primary focus:ring-0 focus:outline-none cursor-pointer" id="remember-device" type="checkbox"/>
 <span className="text-sm text-on-surface-variant">Remember this device</span>
 </label>
 <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-fixed transition-colors">
 Forgot password?
 </Link>
 </div>

 <button 
 className={`w-full h-12 rounded ${isLoading ? 'bg-primary-container opacity-80 pointer-events-none' : 'bg-primary hover:bg-primary-container active:scale-[0.99]'} text-on-primary font-medium text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all mt-3`}
 type="submit"
 >
 {isLoading ? (
 <>
 <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
 <span>Authenticating...</span>
 </>
 ) : (
 <>
 <span>Log In</span>
 <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
 </>
 )}
 </button>
 </form>

 <div className="relative flex items-center justify-center my-6">
 <div className="w-full h-px bg-surface-container-high"></div>
 <span className="absolute px-3 bg-surface-container-lowest text-on-surface-variant text-xs font-semibold uppercase tracking-wider uppercase">
 or continue with enterprise SSO
 </span>
 </div>

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
 <span>Google Workspace</span>
 </button>
 <button className="w-full h-11 px-4 rounded bg-surface-container hover:bg-surface-container-high active:scale-[0.99] flex items-center justify-center gap-3 transition-colors text-on-surface text-sm font-medium shadow-sm" type="button">
 <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
 <path d="M1 1h10v10H1z" fill="#f35325"></path>
 <path d="M12 1h10v10H12z" fill="#81bc06"></path>
 <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
 <path d="M12 12h10v10H12z" fill="#ffba08"></path>
 </svg>
 <span>Microsoft Azure AD / Entra ID</span>
 </button>
 </div>
 </div>

 <div className="rounded-xl bg-surface-container-high p-4 flex items-center justify-between mb-8 shadow-sm">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-9 h-9 rounded-lg bg-inverse-surface flex items-center justify-center text-primary-fixed shrink-0">
 <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-medium text-sm font-semibold text-on-surface truncate">New to Closecraft?</span>
 <span className="text-sm text-on-surface-variant truncate">14-day trial with full AI Autopilot</span>
 </div>
 </div>
 <Link href="/signup" className="shrink-0 px-4 py-2 rounded bg-inverse-surface text-inverse-on-surface hover:bg-on-surface transition-colors text-sm font-medium font-semibold ml-2">
 Start Free
 </Link>
 </div>

 <div className="flex flex-col items-center justify-center gap-2 text-center px-3">
 <div className="flex items-center gap-1.5 text-on-surface-variant">
 <span className="material-symbols-outlined text-[16px] text-primary">security</span>
 <span className="text-xs font-semibold uppercase uppercase tracking-wider">Enterprise Security Protocol</span>
 </div>
 <p className="text-sm text-secondary">
 SOC2 Type II Certified • 256-Bit NDPR & GDPR Compliant Security
 </p>
 </div>
 </div>
 </div>
 );
}
