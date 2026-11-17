'use client';

import React, { useState, useTransition } from 'react';
import { DealCard } from './DealCard';
import { NewDealModal } from './NewDealModal';
import { Badge } from '@/components/ui/Badge';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { seedSampleWorkspaceAction, clearSampleWorkspaceAction } from '@/app/(saas)/actions';
import {
  KanbanSquare,
  List,
  Search,
  Plus,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Database,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface DealRecord {
  id: string;
  title?: string | null;
  amount: number;
  stage: string;
  currency: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  closer?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    buyingIntent?: number | null;
    revenueActions?: Array<{
      type: string;
      recommendedActor: string;
      priority: number;
      reason?: string | null;
    }>;
  };
}

interface PipelineClientProps {
  deals: DealRecord[];
  availableLeads: Array<{ id: string; name: string }>;
}

const STAGES = ['OPPORTUNITY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;

export default function PipelineClient({ deals, availableLeads }: PipelineClientProps) {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isSeeding, startSeedTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSeedWorkspace = () => {
    startSeedTransition(async () => {
      try {
        await seedSampleWorkspaceAction();
        showToast('🚀 Seeded 3 realistic demo leads & pipeline deals!');
      } catch (err: any) {
        showToast(err.message || 'Failed to seed demo workspace');
      }
    });
  };

  const handleClearWorkspace = () => {
    startSeedTransition(async () => {
      try {
        await clearSampleWorkspaceAction();
        showToast('🧹 Cleaned up sample demo deals from workspace.');
      } catch (err: any) {
        showToast(err.message || 'Failed to clear sample workspace');
      }
    });
  };

  const hasDemoSeed = deals.some((d) => d.title?.includes('[DEMO_SEED]'));

  const filteredDeals = deals.filter((deal) => {
    if (stageFilter !== 'ALL' && deal.stage !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = deal.lead.name.toLowerCase().includes(q);
      const emailMatch = deal.lead.email.toLowerCase().includes(q);
      const titleMatch = deal.title?.toLowerCase().includes(q) ?? false;
      return nameMatch || emailMatch || titleMatch;
    }
    return true;
  });

  const totalValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const wonDeals = deals.filter((d) => d.stage === 'WON');
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const openDeals = deals.filter((d) => !['WON', 'LOST'].includes(d.stage));
  const openValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'WON':
        return 'success';
      case 'LOST':
        return 'destructive';
      case 'NEGOTIATION':
        return 'primary';
      case 'PROPOSAL':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 w-full h-full">
      {/* Top Header & Fast Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              SALES PIPELINE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
            Deal Flow &amp; Pipeline
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Manage stage progression, mitigate stalled opportunities, and close high-value revenue deals.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-surface-container rounded-xl border border-outline-variant/30">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'KANBAN'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Kanban Board View"
              aria-label="Kanban Board View"
            >
              <KanbanSquare size={16} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'LIST'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>

          <NewDealModal leads={availableLeads} />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-surface-container-highest border border-primary/30 text-on-surface shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Demo Workspace Active Banner */}
      {hasDemoSeed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-semibold">Demo Pipeline Active:</strong> Showing realistic sample deals across stages.
            </span>
          </div>
          <button
            onClick={handleClearWorkspace}
            disabled={isSeeding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-amber-300 hover:text-white hover:bg-red-500/20 border border-amber-500/30 font-semibold text-xs transition-all shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Clearing...' : 'Clear Demo Deals'}</span>
          </button>
        </div>
      )}

      {/* Day-0 Empty State when workspace has no deals */}
      {deals.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-container-lowest border border-outline-variant/30 text-center max-w-2xl mx-auto space-y-6 my-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Database className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-on-surface">Your Sales Pipeline is Ready</h3>
            <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
              No active deals in your pipeline yet. Add your first deal manually or seed 3 realistic demo deals to test Kanban drag-and-drop progression, revenue forecasting, and closer assignments.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeedWorkspace}
              disabled={isSeeding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSeeding ? 'Seeding Demo Pipeline...' : 'Seed 3 Realistic Demo Deals'}</span>
            </button>
            <NewDealModal leads={availableLeads} />
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Total Pipeline</p>
          <p className="text-lg font-bold font-mono text-on-surface">
            ₦{totalValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-on-surface-variant block">{deals.length} deals total</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Open Value</p>
          <p className="text-lg font-bold font-mono text-primary">
            ₦{openValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-primary font-semibold block">{openDeals.length} active opportunities</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Closed-Won</p>
          <p className="text-lg font-bold font-mono text-emerald-400">
            ₦{wonValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block">{wonDeals.length} closed deals</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1">
          <p className="text-[11px] font-medium text-on-surface-variant">Win Rate</p>
          <p className="text-lg font-bold font-mono text-on-surface">
            {deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0}%
          </p>
          <span className="text-[10px] text-on-surface-variant block">Conversion efficiency</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              stageFilter === 'ALL'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            All Stages ({deals.length})
          </button>
          {STAGES.map((st) => {
            const count = deals.filter((d) => d.stage === st).length;
            return (
              <button
                key={st}
                onClick={() => setStageFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  stageFilter === st
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search deals or prospects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-container text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-on-surface-variant/60"
          />
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="w-full overflow-x-auto pb-6">
          <div className="flex items-start gap-4 min-w-[1000px]">
            {STAGES.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stage === stage);
              const stageVal = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

              return (
                <div
                  key={stage}
                  className="flex flex-col w-80 shrink-0 bg-surface-container-low rounded-3xl border border-outline-variant/40 shadow-xs max-h-[calc(100vh-320px)] min-h-[480px]"
                >
                  {/* Column Header */}
                  <div className="p-4 border-b border-outline-variant/30 bg-surface-container/40 rounded-t-3xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
                        {stage}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="font-mono font-extrabold text-xs text-primary">
                      ₦{stageVal.toLocaleString()}
                    </p>
                  </div>

                  {/* Deals Stream */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {stageDeals.length === 0 ? (
                      <div className="p-6 text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/30 rounded-2xl my-2">
                        No deals in {stage.toLowerCase()}
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal as any} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW (Table on Desktop / Cards on Mobile) */}
      {viewMode === 'LIST' && (
        <div className="w-full">
          <ResponsiveTable<DealRecord>
            data={filteredDeals}
            keyExtractor={(deal) => deal.id}
            emptyMessage="No deals match your selected filters."
            columns={[
              {
                key: 'prospect',
                header: 'Prospect & Deal',
                render: (deal: DealRecord) => (
                  <div className="space-y-0.5">
                    <p className="font-bold text-sm text-on-surface">{deal.lead.name}</p>
                    <p className="text-xs text-on-surface-variant">{deal.title || deal.lead.email}</p>
                  </div>
                ),
              },
              {
                key: 'value',
                header: 'Deal Value',
                render: (deal: DealRecord) => (
                  <span className="font-mono font-bold text-xs text-primary">
                    ₦{deal.amount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'stage',
                header: 'Stage',
                render: (deal: DealRecord) => (
                  <Badge variant={getStageBadgeVariant(deal.stage) as any}>
                    {deal.stage}
                  </Badge>
                ),
              },
              {
                key: 'intent',
                header: 'Intent',
                render: (deal: DealRecord) => (
                  <span className="text-xs font-mono font-semibold text-on-surface-variant">
                    {deal.lead.buyingIntent ?? 50}%
                  </span>
                ),
              },
              {
                key: 'closer',
                header: 'Assigned Closer',
                render: (deal: DealRecord) => (
                  <span className="text-xs text-on-surface-variant">
                    {deal.closer?.name || deal.closer?.email?.split('@')[0] || 'Unassigned'}
                  </span>
                ),
              },
              {
                key: 'action',
                header: 'Next Action',
                render: (deal: DealRecord) => {
                  const act = deal.lead.revenueActions?.[0];
                  if (!act) return <span className="text-xs text-on-surface-variant">—</span>;
                  return (
                    <span className="text-xs font-mono text-primary font-semibold">
                      {act.type.replace(/_/g, ' ')}
                    </span>
                  );
                },
              },
            ]}
          />
        </div>
      )}
      </>
      )}
    </div>
  );
}
