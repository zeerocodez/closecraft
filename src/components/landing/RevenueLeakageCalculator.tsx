'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CurrencyCode, CURRENCY_CONFIGS, formatCurrencyAmount } from '@/lib/tools/diagnostic-scoring';

interface RevenueLeakageCalculatorProps {
  onOpenAuditModal?: (initialData?: {
    leadVolume: string;
    monthlyLeak: string;
    responseTime: string;
    currency?: string;
  }) => void;
}

type ResponseTimeSpeed = 'UNDER_15_MINS' | 'HOURS_1_TO_4' | 'HOURS_24_PLUS' | 'DAYS_LATER';

export default function RevenueLeakageCalculator({ onOpenAuditModal }: RevenueLeakageCalculatorProps) {
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [monthlyEnquiries, setMonthlyEnquiries] = useState<number>(150);
  const [averageDealValue, setAverageDealValue] = useState<number>(120000);
  const [responseTime, setResponseTime] = useState<ResponseTimeSpeed>('HOURS_1_TO_4');

  // Benchmark close rates based on response speed
  const benchmarkRates: Record<ResponseTimeSpeed, { label: string; rate: number; badge: string; color: string }> = {
    UNDER_15_MINS: {
      label: 'Within 15 minutes (Rapid SLA)',
      rate: 0.18,
      badge: 'Best Practice',
      color: 'text-[#45bfae] bg-[#248277]/20 border-[#248277]/40',
    },
    HOURS_1_TO_4: {
      label: '1 to 4 hours (Delayed)',
      rate: 0.10,
      badge: 'Common Friction',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
    },
    HOURS_24_PLUS: {
      label: '24+ hours (Sluggish)',
      rate: 0.04,
      badge: 'High Leakage',
      color: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
    },
    DAYS_LATER: {
      label: 'Days later or forgotten (Severe)',
      rate: 0.015,
      badge: 'Critical Loss',
      color: 'text-red-400 bg-red-500/20 border-red-500/40',
    },
  };

  const results = useMemo(() => {
    const currentRate = benchmarkRates[responseTime].rate;
    const optimalRate = benchmarkRates.UNDER_15_MINS.rate;

    const currentDeals = Math.round(monthlyEnquiries * currentRate);
    const optimalDeals = Math.round(monthlyEnquiries * optimalRate);
    const additionalDeals = Math.max(0, optimalDeals - currentDeals);

    const currentRevenue = currentDeals * averageDealValue;
    const optimalRevenue = optimalDeals * averageDealValue;
    const monthlyLeak = Math.max(0, optimalRevenue - currentRevenue);
    const annualLeak = monthlyLeak * 12;

    const liftPercentage = currentRevenue > 0 
      ? Math.round(((optimalRevenue - currentRevenue) / currentRevenue) * 100) 
      : 0;

    return {
      currentDeals,
      optimalDeals,
      additionalDeals,
      currentRevenue,
      optimalRevenue,
      monthlyLeak,
      annualLeak,
      liftPercentage,
    };
  }, [monthlyEnquiries, averageDealValue, responseTime]);

  function formatNGN(amount: number): string {
    return formatCurrencyAmount(amount, currency);
  }

  function handleTriggerAudit() {
    if (onOpenAuditModal) {
      onOpenAuditModal({
        leadVolume: `${monthlyEnquiries} monthly enquiries`,
        monthlyLeak: formatCurrencyAmount(results.monthlyLeak, currency),
        responseTime: benchmarkRates[responseTime].label,
        currency,
      });
    }
  }

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-[#0a0a0c] border border-[#1f1f1f] shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1f1f1f] gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141416] border border-[#248277]/40 text-[#45bfae] text-[11px] font-bold uppercase tracking-wider">
            <Calculator size={13} />
            <span>INTERACTIVE ROI CALCULATOR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Estimate How Much Revenue You Lose to Delayed Follow-Up
          </h3>
          <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
            Adjust the sliders below to see the commercial impact of response lag on your monthly and annual revenue.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-[#141416] p-1 rounded-xl border border-white/10 text-xs font-mono font-bold">
            {(['NGN', 'USD', 'GBP'] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === c ? 'bg-[#248277] text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {CURRENCY_CONFIGS[c].symbol} {c}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400">
            *Illustrative Benchmark Model
          </span>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sliders & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Slider 1: Monthly Enquiries */}
          <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="enquiry-slider" className="text-xs font-bold text-zinc-300">
                1. Monthly Inbound Enquiries Received
              </label>
              <span className="text-base font-extrabold text-white font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">
                {monthlyEnquiries} leads / mo
              </span>
            </div>
            <input
              id="enquiry-slider"
              type="range"
              min="20"
              max="1000"
              step="10"
              value={monthlyEnquiries}
              onChange={(e) => setMonthlyEnquiries(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#248277]"
              aria-label="Monthly Inbound Enquiries Received"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>20 leads</span>
              <span>250 leads</span>
              <span>500 leads</span>
              <span>1,000+ leads</span>
            </div>
          </div>

          {/* Slider 2: Average Deal Value */}
          <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="deal-value-slider" className="text-xs font-bold text-zinc-300">
                2. Average Revenue Per Closed Customer
              </label>
              <span className="text-base font-extrabold text-[#45bfae] font-mono bg-zinc-900 px-3 py-1 rounded-lg border border-white/5">
                {formatNGN(averageDealValue)}
              </span>
            </div>
            <input
              id="deal-value-slider"
              type="range"
              min="25000"
              max="1500000"
              step="25000"
              value={averageDealValue}
              onChange={(e) => setAverageDealValue(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#248277]"
              aria-label="Average Revenue Per Closed Customer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>{formatCurrencyAmount(25000, currency)}</span>
              <span>{formatCurrencyAmount(250000, currency)}</span>
              <span>{formatCurrencyAmount(750000, currency)}</span>
              <span>{formatCurrencyAmount(1500000, currency)}</span>
            </div>
          </div>

          {/* Selector 3: First Response Time */}
          <div className="p-5 rounded-2xl bg-[#101010] border border-[#1f1f1f] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">
                3. Your Typical First Response Time to Inbound Leads
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${benchmarkRates[responseTime].color}`}>
                {benchmarkRates[responseTime].badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(Object.keys(benchmarkRates) as ResponseTimeSpeed[]).map((key) => {
                const item = benchmarkRates[key];
                const isSelected = responseTime === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResponseTime(key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-[#182321] border-[#248277] text-white shadow-md'
                        : 'bg-[#141416] border-[#222226] text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold leading-tight">{item.label}</span>
                      {isSelected && <CheckCircle2 size={13} className="text-[#45bfae] shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Est. ~{Math.round(item.rate * 100)}% conversion
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Impact Dashboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#111817] to-[#0c0f0f] border border-[#248277]/50 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">
                ESTIMATED REVENUE LEAK
              </span>
              <h4 className="text-sm font-semibold text-zinc-400">
                Monthly Lost to Follow-Up Delay:
              </h4>
              <div className="text-3xl sm:text-4xl font-black text-red-400 tracking-tight font-mono pt-1">
                {formatNGN(results.monthlyLeak)}
                <span className="text-xs font-normal text-zinc-400 block pt-0.5">/ month in missed sales</span>
              </div>
            </div>

            {/* Annual Figure */}
            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1f1f1f] space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                Annualized Revenue At Risk
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                {formatNGN(results.annualLeak)}
                <span className="text-xs font-normal text-zinc-400"> / year</span>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-zinc-400">Current Est. Deals Closed:</span>
                <span className="font-mono font-bold text-zinc-300">
                  {results.currentDeals} deals / mo ({formatNGN(results.currentRevenue)})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-zinc-400">Potential with CloseCraft SLAs:</span>
                <span className="font-mono font-bold text-[#45bfae]">
                  {results.optimalDeals} deals / mo ({formatNGN(results.optimalRevenue)})
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-300 font-semibold">Recoverable Deals:</span>
                <span className="font-mono font-bold text-white bg-[#248277]/20 border border-[#248277]/40 px-2 py-0.5 rounded">
                  +{results.additionalDeals} deals / mo (+{results.liftPercentage}%)
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerAudit}
                className="w-full py-3.5 px-4 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#248277]/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>FIX YOUR FOLLOW-UP LEAKAGE</span>
                <ArrowRight size={15} />
              </button>
              <p className="text-[11px] text-center text-zinc-500 pt-2">
                Free assessment &middot; Plug your lead leakage in under 7 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
