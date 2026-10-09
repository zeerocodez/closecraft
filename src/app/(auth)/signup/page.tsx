import Link from 'next/link';

export default function SignupPage() {
 return (
 <div className="flex flex-col w-full px-4 md:px-8 pb-8 pt-8 min-h-screen justify-center items-center bg-surface">
 <div className="w-full max-w-md mx-auto flex flex-col items-center text-center">
 <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight mb-2">Create your Workspace</h1>
 <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed mb-6">
 Start your 14-day free trial. No credit card required.
 </p>
 
 <div className="w-full bg-surface-container-lowest shadow-xl p-6 rounded-xl border border-surface-container mb-6">
 <p className="text-sm text-on-surface-variant mb-4">Account creation is temporarily disabled in this deployment environment. Please contact your administrator or book an audit.</p>
 <Link href="/login" className="w-full h-12 rounded bg-primary hover:bg-primary-container text-on-primary font-medium font-semibold flex items-center justify-center transition-all">
 Back to Login
 </Link>
 </div>
 </div>
 </div>
 );
}
