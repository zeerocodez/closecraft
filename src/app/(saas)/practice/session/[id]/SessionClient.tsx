'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { submitPracticeTurn, finishAndEvaluateSession } from '@/app/(saas)/practice-actions';

export default function SessionClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const { session, scenario } = initialData;

  const [turns, setTurns] = useState<any[]>(initialData.turns || []);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showBriefPanel, setShowBriefPanel] = useState(false);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isSubmitting]);

  const currentTurnCount = turns.length;
  const maxTurns = scenario.maxTurns || 6;
  const isTurnLimitReached = currentTurnCount >= maxTurns;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || isSubmitting || isEvaluating) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const clientRequestId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Optimistically show student turn
    const tempStudentTurn = {
      id: `temp_${Date.now()}`,
      turnNumber: currentTurnCount + 1,
      senderType: 'STUDENT',
      content,
      createdAt: new Date().toISOString(),
      clientRequestId,
    };

    setTurns((prev) => [...prev, tempStudentTurn]);
    setInputText('');

    try {
      const res = await submitPracticeTurn({
        sessionId: session.id,
        clientRequestId,
        content,
      });

      if (res.success) {
        setTurns((prev) => {
          // Replace temp turn with authoritative student turn and append buyer turn
          const filtered = prev.filter((t) => t.id !== tempStudentTurn.id);
          const nextList = [...filtered, res.studentTurn];
          if (res.buyerTurn) {
            nextList.push(res.buyerTurn);
          }
          return nextList;
        });

        if (res.isEndingTurn) {
          // Automatic prompt to evaluate when turn limit is reached
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit response. Please check your connection.');
      // Rollback optimistic turn on failure
      setTurns((prev) => prev.filter((t) => t.id !== tempStudentTurn.id));
      setInputText(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFinishAndEvaluate = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await finishAndEvaluateSession(session.id);
      if (res.success) {
        router.push(`/practice/review/${session.id}`);
      } else {
        setErrorMessage(res.error || 'Evaluation could not be completed.');
        setIsEvaluating(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Evaluation service error.');
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Session Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/practice"
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Return to Practice Studio"
          >
            <Icon name="ArrowLeft" size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {scenario.difficulty}
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Turn {currentTurnCount} of {maxTurns}
              </span>
            </div>
            <h1 className="text-base font-bold text-on-surface mt-0.5">
              {scenario.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowBriefPanel(!showBriefPanel)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            <Icon name={showBriefPanel ? 'EyeOff' : 'FileText'} size={15} />
            {showBriefPanel ? 'Hide Brief' : 'Approved Facts & Brief'}
          </button>

          <button
            type="button"
            onClick={handleFinishAndEvaluate}
            disabled={isEvaluating || turns.filter((t) => t.senderType === 'STUDENT').length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isEvaluating ? (
              <>
                <Icon name="Loader2" size={15} className="animate-spin" />
                Evaluating Transcript...
              </>
            ) : (
              <>
                <Icon name="CheckCircle2" size={15} />
                End & Evaluate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Student Brief & Approved Terms Drawer */}
      {showBriefPanel && (
        <div className="p-5 rounded-xl border border-primary/30 bg-surface-container-lowest space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Icon name="ShieldCheck" size={18} className="text-primary" />
                Student Brief & Approved Offer Truth
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Always ground your statements in verified facts. Private buyer conditions and keys are held server-side.
              </p>
            </div>
            <button
              onClick={() => setShowBriefPanel(false)}
              className="text-on-surface-variant hover:text-on-surface p-1"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-3.5 rounded-lg bg-surface-container-high/50 border border-outline-variant/20">
              <div>
                <strong className="text-on-surface uppercase tracking-wider text-[10px] font-mono">
                  Learning Objective
                </strong>
                <p className="text-on-surface-variant mt-1 leading-relaxed">
                  {scenario.learningObjective}
                </p>
              </div>
              <div>
                <strong className="text-on-surface uppercase tracking-wider text-[10px] font-mono">
                  Scenario Brief
                </strong>
                <p className="text-on-surface-variant mt-1 leading-relaxed">
                  {scenario.studentBrief}
                </p>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-lg bg-surface-container-high/50 border border-outline-variant/20">
              <div>
                <strong className="text-on-surface uppercase tracking-wider text-[10px] font-mono">
                  Approved Offer Terms
                </strong>
                <ul className="mt-1 space-y-1 text-on-surface-variant">
                  <li>• <strong>Product:</strong> {scenario.approvedOfferFacts.name}</li>
                  <li>• <strong>Approved Price:</strong> {scenario.approvedOfferFacts.price}</li>
                  <li>• <strong>Scope:</strong> {scenario.approvedOfferFacts.scope.join(', ')}</li>
                  <li className="text-amber-400">• <strong>Exclusions:</strong> {scenario.approvedOfferFacts.exclusions.join(', ')}</li>
                </ul>
              </div>
              <div>
                <strong className="text-on-surface uppercase tracking-wider text-[10px] font-mono">
                  Buyer Persona
                </strong>
                <p className="text-on-surface-variant mt-1">
                  {scenario.buyerPersona.name} ({scenario.buyerPersona.title}, {scenario.buyerPersona.company})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest flex flex-col h-[560px] shadow-sm overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {turns.map((turn: any) => {
            const isStudent = turn.senderType === 'STUDENT';
            return (
              <div
                key={turn.id || turn.turnNumber}
                className={`flex gap-3 max-w-3xl ${isStudent ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isStudent
                      ? 'bg-primary text-primary-contrast'
                      : 'bg-surface-container-highest text-on-surface border border-outline-variant/40'
                  }`}
                >
                  {isStudent ? 'You' : scenario.buyerPersona.name.substring(0, 1)}
                </div>

                <div className={`space-y-1 ${isStudent ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 text-[11px] ${isStudent ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-semibold text-on-surface">
                      {isStudent ? 'You (Sales Rep)' : scenario.buyerPersona.name}
                    </span>
                    <span className="text-on-surface-variant font-mono">
                      Turn {turn.turnNumber}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isStudent
                        ? 'bg-primary text-primary-contrast rounded-tr-none'
                        : 'bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{turn.content}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {isSubmitting && (
            <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center text-xs font-bold border border-outline-variant/40">
                {scenario.buyerPersona.name.substring(0, 1)}
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-high text-xs text-on-surface-variant flex items-center gap-2 rounded-tl-none border border-outline-variant/30">
                <Icon name="Loader2" size={14} className="animate-spin text-primary" />
                {scenario.buyerPersona.name} is evaluating your response...
              </div>
            </div>
          )}

          <div ref={turnsEndRef} />
        </div>

        {/* Turn Limit Warning */}
        {isTurnLimitReached && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-400 flex items-center justify-between">
            <span>
              Configured scenario turn limit reached ({maxTurns} turns). Wrap up and click End & Evaluate.
            </span>
            <button
              onClick={handleFinishAndEvaluate}
              disabled={isEvaluating}
              className="text-xs underline font-bold hover:text-amber-300"
            >
              Finish Now
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:text-red-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-outline-variant/30 bg-surface-container-high/30">
          <form onSubmit={handleSend} className="space-y-2">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isTurnLimitReached
                    ? 'Final response or summary...'
                    : `Type your response to ${scenario.buyerPersona.name}... (Press Enter to send, Shift+Enter for new line)`
                }
                rows={3}
                disabled={isSubmitting || isEvaluating}
                className="w-full resize-none p-3.5 text-sm rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono">
                <span>{inputText.length} chars</span>
                <span>•</span>
                <span>Enter to Send</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/practice"
                  className="px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Save & Pause
                </Link>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSubmitting || isEvaluating}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-contrast hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="Loader2" size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={14} />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
