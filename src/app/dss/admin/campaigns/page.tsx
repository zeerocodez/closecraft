import React from 'react';
import Link from 'next/link';
import { Tag, ShieldCheck, CheckCircle2, Clock, Users, ArrowLeft, AlertCircle, Percent } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DSSLogo } from '@/components/ui/Logo';
import { DSS_PRODUCTS } from '@/lib/dss/products';
import { DSS_EARLY_BIRD_CONFIG } from '@/lib/dss/early-bird';

export default async function DSSAdminCampaignsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Fetch campaign record or initialize from config
  let campaign = await db.earlyBirdCampaign.findUnique({
    where: { code: DSS_EARLY_BIRD_CONFIG.code },
  });

  if (!campaign) {
    try {
      campaign = await db.earlyBirdCampaign.create({
        data: {
          name: DSS_EARLY_BIRD_CONFIG.name,
          code: DSS_EARLY_BIRD_CONFIG.code,
          discountPercent: DSS_EARLY_BIRD_CONFIG.discountPercentage,
          isActive: DSS_EARLY_BIRD_CONFIG.isActive,
          eligibleProductSlugs: DSS_EARLY_BIRD_CONFIG.eligibleProductSlugs,
          currency: DSS_EARLY_BIRD_CONFIG.currency,
        },
      });
    } catch {
      // Fallback to memory config if db write fails in preview
    }
  }

  // Fetch reservations & redemptions
  const reservations = await db.discountReservation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const confirmedCount = reservations.filter((r) => r.status === 'REDEEMED').length;
  const activeReservationsCount = reservations.filter(
    (r) => r.status === 'RESERVED' && r.expiresAt > new Date()
  ).length;

  return (
    <div className="min-h-screen bg-[#071126] text-[#F3F7FA] font-sans">
      {/* Top Navigation */}
      <header className="bg-[#071126]/90 backdrop-blur-xl border-b border-white/10 h-16 flex items-center px-6 sticky top-0 z-40">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DSSLogo variant="icon" size="sm" alt="Digital Sales School" />
            <span className="font-bold text-white text-base sm:text-lg">DSS Administration</span>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-xs font-bold">
              <Link href="/dss/admin" className="text-[#94A3B8] hover:text-white py-5">
                Curriculum
              </Link>
              <Link href="/dss/admin/students" className="text-[#94A3B8] hover:text-white py-5">
                Students
              </Link>
              <Link
                href="/dss/admin/campaigns"
                className="text-[#38BDF8] border-b-2 border-[#38BDF8] py-5"
              >
                Campaigns
              </Link>
              <Link href="/dss/admin/emails" className="text-[#94A3B8] hover:text-white py-5">
                Email Previews
              </Link>
            </nav>

            <Link
              href="/dss"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/10"
            >
              &larr; View Landing Page
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#0066FF]/10 px-3 py-1 rounded-full border border-[#0066FF]/30 mb-2">
              <Tag size={13} /> Promotion & Admissions Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              DSS Early Bird Offer Management
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Centrally managed 50% discount campaign (<code className="text-[#38BDF8]">cohort001</code>) for eligible DSS tuition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold">
              <CheckCircle2 size={14} /> Campaign Active
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-semibold text-[#94A3B8] mb-1">Discount Rate</div>
            <div className="text-2xl font-extrabold text-[#38BDF8]">50%</div>
            <div className="text-[11px] text-[#94A3B8] mt-1">Authoritative base tuition reduction</div>
          </div>

          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-semibold text-[#94A3B8] mb-1">Confirmed Redemptions</div>
            <div className="text-2xl font-extrabold text-white">{confirmedCount}</div>
            <div className="text-[11px] text-[#94A3B8] mt-1">Settled payments with verified coupon</div>
          </div>

          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-semibold text-[#94A3B8] mb-1">Active Locks (Pending)</div>
            <div className="text-2xl font-extrabold text-[#F59E0B]">{activeReservationsCount}</div>
            <div className="text-[11px] text-[#94A3B8] mt-1">30-minute bounded checkout locks</div>
          </div>

          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-5">
            <div className="text-xs font-semibold text-[#94A3B8] mb-1">Learner Limit</div>
            <div className="text-2xl font-extrabold text-[#10B981]">1 Use</div>
            <div className="text-[11px] text-[#94A3B8] mt-1">Strict concurrency & duplicate protection</div>
          </div>
        </div>

        {/* Scope Mapping Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Eligible Products */}
          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Explicitly Mapped Eligible Products</span>
            </h3>

            <div className="space-y-3">
              {DSS_PRODUCTS.map((prod) => {
                const regular = prod.priceNGN;
                const earlyBird = Math.round(regular * 0.5);
                const savings = regular - earlyBird;

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl bg-[#071126] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{prod.title}</div>
                      <div className="text-xs text-[#94A3B8]">Slug: {prod.slug}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#94A3B8] line-through">₦{regular.toLocaleString()}</div>
                      <div className="text-sm font-extrabold text-[#38BDF8]">₦{earlyBird.toLocaleString()}</div>
                      <div className="text-[11px] font-semibold text-[#10B981]">Save ₦{savings.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Explicitly Excluded Offerings */}
          <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
              <span>Explicitly Excluded Offerings (Unstackable)</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#071126] border border-white/5">
                <div className="font-bold text-white text-sm">Closecraft Starter Plan</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  ₦20,000/month • Software subscription. Excluded from tuition discounts.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071126] border border-white/5">
                <div className="font-bold text-white text-sm">Closecraft Pro Plan</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  ₦45,000/month • Software subscription. Excluded from tuition discounts.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071126] border border-white/5">
                <div className="font-bold text-white text-sm">Closecraft 7-Day Starter Trial</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  168-hour free trial • No card required, no tuition access granted.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#071126] border border-white/5">
                <div className="font-bold text-white text-sm">Managed Sales Services & Human Engagements</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  Separately scoped client service agreements. Excluded from training codes.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log & Reservations Table */}
        <div className="bg-[#0B1733] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            <span>Discount Reservations & Redemption Audit Trail</span>
          </h3>

          {reservations.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#94A3B8]">
              No early bird reservations or redemptions recorded yet. Synthetic checkouts and learner purchases will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#94A3B8]">
                    <th className="pb-3 font-semibold">Learner Email</th>
                    <th className="pb-3 font-semibold">Programme</th>
                    <th className="pb-3 font-semibold">Discount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Created</th>
                    <th className="pb-3 font-semibold">Order / Payment Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reservations.map((res) => (
                    <tr key={res.id} className="text-white hover:bg-white/[0.02]">
                      <td className="py-3 font-mono">{res.learnerEmail}</td>
                      <td className="py-3">{res.productSlug}</td>
                      <td className="py-3 text-[#10B981] font-semibold">
                        ₦{(res.discountAmountKobo / 100).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            res.status === 'REDEEMED'
                              ? 'bg-[#10B981]/20 text-[#10B981]'
                              : res.status === 'RESERVED'
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                              : 'bg-white/10 text-[#94A3B8]'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#94A3B8]">
                        {new Date(res.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#94A3B8]">
                        {res.paymentReference || 'Pending Checkout'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
