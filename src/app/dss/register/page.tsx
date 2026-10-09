import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function DSSRegisterPage() {
 return (
 <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
 <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container p-8">
 <div className="flex justify-center mb-6">
 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
 <BookOpen className="text-primary" size={24} />
 </div>
 </div>
 
 <h1 className="text-2xl font-headline-lg font-bold text-center text-on-surface mb-2">
 Digital Sales School
 </h1>
 <p className="text-on-surface-variant text-center mb-8 font-body-md">
 Create your account to access the AI-powered LMS and certification programs.
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
 <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
 <input 
 required
 type="password" 
 className="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
 placeholder="••••••••"
 />
 </div>

 <button type="submit" className="w-full mt-6 py-3 px-4 bg-primary text-on-primary rounded-xl font-bold font-label-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm">
 Create Account <ArrowRight size={18} />
 </button>
 </form>

 <p className="mt-6 text-center text-sm text-on-surface-variant">
 Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
 </p>
 </div>
 </div>
 );
}
