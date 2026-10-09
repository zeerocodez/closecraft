import Link from 'next/link';

export default function ForgotPasswordPage() {
 return (
 <div className="flex flex-col w-full px-4 md:px-8 pb-8 pt-8 min-h-screen justify-center items-center bg-surface">
 <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
 <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-2">Reset Password</h1>
 <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed mb-6">
 Enter your email to receive a reset link.
 </p>
 
 <div className="w-full bg-surface-container-lowest shadow-xl p-6 rounded-xl border border-surface-container mb-6">
 <input type="email" placeholder="Work Email" className="w-full h-11 px-3 mb-4 rounded bg-surface-container-low text-on-surface border border-outline-variant" />
 <button className="w-full h-12 rounded bg-primary hover:bg-primary-container text-on-primary font-medium font-semibold flex items-center justify-center transition-all mb-4">
 Send Reset Link
 </button>
 <Link href="/login" className="text-sm text-primary hover:underline">
 Back to Login
 </Link>
 </div>
 </div>
 </div>
 );
}
