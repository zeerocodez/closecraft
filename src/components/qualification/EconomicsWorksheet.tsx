'use client';

import React, { useState } from 'react';
import { EconomicsAnswers } from '@/lib/qualification/types';
import { calculateEconomicsAssessment } from '@/lib/qualification/economics';
import { Icon } from '@/components/ui/Icon';

interface EconomicsWorksheetProps {
  initialValues?: Partial<EconomicsAnswers>;
  onChange?: (values: EconomicsAnswers) => void;
  readOnly?: boolean;
}

export default function EconomicsWorksheet({
  initialValues,
  onChange,
  readOnly = false,
}: EconomicsWorksheetProps) {
  const [currency] = useState(initialValues?.currency || 'NGN');
  const [expectedSales, setExpectedSales] = useState<number | string>(initialValues?.expectedAttributableSales ?? 4);
  const [typicalSaleValue, setTypicalSaleValue] = useState<number | string>(initialValues?.typicalSaleValue ?? 100000);
  const [directDeliveryCost, setDirectDeliveryCost] = useState<number | string>(initialValues?.directDeliveryCost ?? 30000);
  const [fixedCost, setFixedCost] = useState<number | string>(initialValues?.fixedEngagementCost ?? 150000);
  const [variableFee, setVariableFee] = useState<number | string>(initialValues?.variableFeePerSale ?? 0);
  const [historicalConversations, setHistoricalConversations] = useState<number | string>(initialValues?.historicalConversations ?? '');
  const [historicalSales, setHistoricalSales] = useState<number | string>(initialValues?.historicalSales ?? '');
  const [sameCohort, setSameCohort] = useState<boolean>(initialValues?.sameCohort ?? true);
  const [evidenceSource, setEvidenceSource] = useState<string>(initialValues?.economicsEvidenceSource ?? 'Client historical CRM data');

  const numExpectedSales = typeof expectedSales === 'number' ? expectedSales : parseFloat(expectedSales) || null;
  const numTypicalValue = typeof typicalSaleValue === 'number' ? typicalSaleValue : parseFloat(typicalSaleValue) || null;
  const numDeliveryCost = typeof directDeliveryCost === 'number' ? directDeliveryCost : parseFloat(directDeliveryCost) || 0;
  const numFixedCost = typeof fixedCost === 'number' ? fixedCost : parseFloat(fixedCost) || 150000;
  const numVariableFee = typeof variableFee === 'number' ? variableFee : parseFloat(variableFee) || 0;

  const grossProfit = numTypicalValue !== null ? Math.max(0, numTypicalValue - numDeliveryCost) : null;

  const currentAnswers: EconomicsAnswers = {
    currency,
    assessmentPeriod: '30_DAYS',
    expectedAttributableSales: numExpectedSales,
    typicalSaleValue: numTypicalValue,
    directDeliveryCost: numDeliveryCost,
    grossProfitPerSale: grossProfit,
    fixedEngagementCost: numFixedCost,
    variableFeePerSale: numVariableFee,
    historicalConversations: typeof historicalConversations === 'number' ? historicalConversations : parseInt(historicalConversations) || null,
    historicalSales: typeof historicalSales === 'number' ? historicalSales : parseInt(historicalSales) || null,
    sameCohort,
    economicsEvidenceSource: evidenceSource,
  };

  const result = calculateEconomicsAssessment(currentAnswers);

  const handleFieldChange = (setter: any, val: any) => {
    setter(val);
    if (onChange) {
      setTimeout(() => {
        onChange(currentAnswers);
      }, 0);
    }
  };

  const currencySymbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : '£';

  return (
    <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-5">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/20">
        <div>
          <h4 className="font-heading font-semibold text-base text-on-surface flex items-center gap-2">
            <Icon name="Calculator" size={18} className="text-primary" />
            <span>Managed Service Economics Assessment</span>
          </h4>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Screening formula: Expected Attributable Sales × Gross Profit Per Sale − Total Engagement Cost = Estimated Contribution.
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary border border-primary/20">
          {currency} (Single Currency Mode)
        </span>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Expected Attributable Sales */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface flex items-center gap-1">
            <span>Expected Attributable Sales (30d)</span>
            <span className="text-primary font-bold">*</span>
          </label>
          <input
            type="number"
            disabled={readOnly}
            min={0}
            step={1}
            value={expectedSales}
            onChange={(e) => handleFieldChange(setExpectedSales, e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            placeholder="e.g. 4"
          />
          <span className="text-[10px] text-on-surface-variant block">
            Only sales reasonably resulting from closer assistance (excludes self-served organic sales).
          </span>
        </div>

        {/* Typical Sale Value */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface">Typical Sale Revenue ({currencySymbol})</label>
          <input
            type="number"
            disabled={readOnly}
            min={0}
            value={typicalSaleValue}
            onChange={(e) => handleFieldChange(setTypicalSaleValue, e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
            placeholder="e.g. 100000"
          />
          <span className="text-[10px] text-on-surface-variant block">
            Customer invoice amount before fulfillment costs.
          </span>
        </div>

        {/* Direct Delivery Cost */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface">Direct Delivery Cost ({currencySymbol})</label>
          <input
            type="number"
            disabled={readOnly}
            min={0}
            value={directDeliveryCost}
            onChange={(e) => handleFieldChange(setDirectDeliveryCost, e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
            placeholder="e.g. 30000"
          />
          <span className="text-[10px] text-on-surface-variant block">
            Fulfillment/product cost per sale (distinguishes gross profit from revenue).
          </span>
        </div>

        {/* Fixed Pilot Cost */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface">Fixed Engagement Cost ({currencySymbol})</label>
          <input
            type="number"
            disabled={readOnly}
            min={0}
            value={fixedCost}
            onChange={(e) => handleFieldChange(setFixedCost, e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
            placeholder="e.g. 150000"
          />
          <span className="text-[10px] text-on-surface-variant block">
            Base compensation for dedicated closer capacity.
          </span>
        </div>

        {/* Variable Performance Fee */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface">Variable Fee / Eligible Sale ({currencySymbol})</label>
          <input
            type="number"
            disabled={readOnly}
            min={0}
            value={variableFee}
            onChange={(e) => handleFieldChange(setVariableFee, e.target.value)}
            className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface"
            placeholder="e.g. 0"
          />
          <span className="text-[10px] text-on-surface-variant block">
            Optional performance fee added per closed deal (no double-counting).
          </span>
        </div>

        {/* Gross Profit Calculated Display */}
        <div className="space-y-1">
          <label className="font-medium text-on-surface">Calculated Gross Profit / Sale</label>
          <div className="h-9 px-3 flex items-center rounded-xl bg-surface-container border border-outline-variant/20 font-mono font-bold text-emerald-400">
            {currencySymbol}{grossProfit !== null ? grossProfit.toLocaleString() : '—'}
          </div>
          <span className="text-[10px] text-on-surface-variant block">
            Revenue minus direct delivery costs.
          </span>
        </div>
      </div>

      {/* Historical Evidence Inputs */}
      <div className="p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface">Historical Evidence Context</span>
          <span className="text-[10px] text-on-surface-variant">Used to validate reasonable attributable sales</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-on-surface-variant block mb-1">Past Conversations (30d)</label>
            <input
              type="number"
              disabled={readOnly}
              value={historicalConversations}
              onChange={(e) => handleFieldChange(setHistoricalConversations, e.target.value)}
              placeholder="e.g. 24"
              className="w-full bg-surface-container-high px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface"
            />
          </div>
          <div>
            <label className="text-[11px] text-on-surface-variant block mb-1">Past Closed Sales (30d)</label>
            <input
              type="number"
              disabled={readOnly}
              value={historicalSales}
              onChange={(e) => handleFieldChange(setHistoricalSales, e.target.value)}
              placeholder="e.g. 4"
              className="w-full bg-surface-container-high px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface"
            />
          </div>
          <div>
            <label className="text-[11px] text-on-surface-variant block mb-1">Evidence Source</label>
            <input
              type="text"
              disabled={readOnly}
              value={evidenceSource}
              onChange={(e) => handleFieldChange(setEvidenceSource, e.target.value)}
              placeholder="e.g. CRM audit, bank records"
              className="w-full bg-surface-container-high px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="sameCohortCheck"
            disabled={readOnly}
            checked={sameCohort}
            onChange={(e) => handleFieldChange(setSameCohort, e.target.checked)}
            className="rounded border-outline-variant bg-surface-container-high text-primary"
          />
          <label htmlFor="sameCohortCheck" className="text-xs text-on-surface-variant cursor-pointer">
            Historical sales and conversations belong to the same cohort / measurement window
          </label>
        </div>
      </div>

      {/* Screened Contribution Result Box */}
      <div className={`p-4 rounded-xl border ${
        !result.isCalculable 
          ? 'bg-amber-500/10 border-amber-500/30'
          : result.isPositiveContribution 
            ? 'bg-emerald-500/10 border-emerald-500/30' 
            : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
              Estimated Contribution After Engagement
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${
                !result.isCalculable ? 'text-amber-300' : result.isPositiveContribution ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {result.isCalculable && result.estimatedContribution !== null
                  ? `${currencySymbol}${result.estimatedContribution.toLocaleString()}`
                  : 'Unassessed (Bounded Pilot Required)'}
              </span>
              {result.isCalculable && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  result.isPositiveContribution ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {result.isPositiveContribution ? 'Positive Return Hypothesis' : 'Negative Contribution Review'}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-right sm:max-w-xs space-y-0.5 font-mono text-on-surface-variant">
            {result.isCalculable ? (
              <>
                <div>Total Engagement Cost: <strong className="text-on-surface">{currencySymbol}{result.totalEngagementCost?.toLocaleString()}</strong></div>
                <div>Gross Revenue Generated: <strong className="text-emerald-400">{currencySymbol}{((result.expectedAttributableSales || 0) * (result.grossProfitPerSale || 0)).toLocaleString()}</strong></div>
              </>
            ) : (
              <span className="text-xs text-amber-300 font-sans">{result.unassessedReason}</span>
            )}
          </div>
        </div>

        {/* Caveats list */}
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
          {result.caveatNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
              <span className="text-secondary">•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
