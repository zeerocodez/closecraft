'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mic, Activity, Loader2 } from 'lucide-react';

export default function DSSRoleplayPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Look, Alex, the platform looks great. Really, it does. But ₦35,000 a month is steep right now. We're trying to cut software costs, not add to them. Can we do this for ₦15,000, or maybe I should just stick to my current spreadsheets for now?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState({
    "Objection Handling": 50,
    "Active Listening": 50,
    "Closing Attempt": 0
  });
  const [coachNote, setCoachNote] = useState("Awaiting your first response to the objection.");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/dss/roleplay/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'dummy-session-id', // Would be from params in real app
          message: userMessage,
          history: messages
        })
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.buyerResponse }]);
      
      if (data.assessment) {
        setScores(data.assessment.scores);
        setCoachNote(data.assessment.coachNote);
      }
    } catch (error) {
      console.error(error);
      setCoachNote("Connection error with AI. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Nav */}
      <header className="bg-surface-container-lowest border-b border-surface-container h-16 flex items-center px-6 shrink-0">
        <div className="w-full flex items-center justify-between">
          <Link href="/dss/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-label-md">
            <ArrowLeft size={16} /> Exit Simulator
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-headline-sm font-bold text-on-surface hidden md:inline">Module 3 Assessment: Executive Objection Handling</span>
            <span className="px-2 py-0.5 rounded bg-error/10 text-error font-label-caps text-[10px] uppercase font-bold animate-pulse ml-2">LIVE EVALUATION</span>
          </div>
          <div className="font-metric-numeral-lg text-primary text-xl font-bold">14:59</div>
        </div>
      </header>

      {/* Main Simulation Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Chat / Transcript Area */}
        <div className="flex-1 flex flex-col relative bg-surface-container-lowest/30">
          
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {/* System Prompt / Context */}
            <div className="max-w-2xl mx-auto mb-8 bg-surface-container-low p-6 rounded-xl border border-surface-container shadow-sm">
              <h3 className="font-headline-sm font-bold text-on-surface mb-2">Scenario Context</h3>
              <p className="text-on-surface-variant font-body-sm mb-4">
                You are on a discovery call with David Chen, CTO of PayPulse Africa. You just presented the pricing 
                of ₦35,000/month for the Growth Engine.
              </p>
              <h4 className="font-bold text-on-surface text-sm">Your Goal:</h4>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1">
                <li>Handle the budget objection professionally.</li>
                <li>Pivot the conversation to the cost of inaction.</li>
                <li>Secure a commitment for a follow-up trial or proposal.</li>
              </ul>
            </div>

            {/* Chat Messages */}
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-on-primary font-bold text-sm' : 'bg-tertiary'}`}>
                  {msg.role === 'user' ? 'ME' : <span className="material-symbols-outlined text-on-primary text-[20px]">smart_toy</span>}
                </div>
                <div className={`${msg.role === 'user' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container border border-surface-container-high text-on-surface rounded-tl-none'} p-4 rounded-2xl shadow-sm max-w-[85%]`}>
                  <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-4 max-w-3xl mx-auto">
                <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">smart_toy</span>
                </div>
                <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none border border-surface-container-high shadow-sm flex items-center gap-2">
                  <Loader2 className="animate-spin text-on-surface-variant" size={18} />
                  <span className="text-on-surface-variant text-sm">David is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-surface-container-lowest border-t border-surface-container">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isLoading}
                className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-3 pl-4 pr-32 text-on-surface resize-none focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                placeholder="Type your response to David..."
                rows={3}
              ></textarea>
              <div className="absolute right-2 bottom-3 flex items-center gap-2">
                <button type="button" className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
                  <Mic size={20} />
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                  Send <Send size={16} />
                </button>
              </div>
            </form>
            <p className="text-center text-xs text-on-surface-variant mt-2 font-label-caps uppercase">
              Press Enter to send. Use the microphone for realistic voice role-play.
            </p>
          </div>
        </div>

        {/* Right Sidebar: Real-time AI Assessor */}
        <aside className="w-full lg:w-80 bg-surface-container-lowest border-l border-surface-container flex flex-col shrink-0">
          <div className="p-6 border-b border-surface-container flex items-center gap-2 text-primary">
            <Activity size={20} />
            <h3 className="font-headline-sm font-bold text-on-surface">Live Assessment</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {Object.entries(scores).map(([metric, score]) => (
              <div key={metric}>
                <div className="flex justify-between text-sm font-bold text-on-surface mb-2">
                  <span>{metric}</span>
                  <span className="text-primary">{score}/100</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${score}%` }}></div>
                </div>
              </div>
            ))}

            <div className="p-4 bg-primary-container/10 border border-primary/20 rounded-xl mt-8 transition-all">
              <h4 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">tips_and_updates</span> Coach's Note
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {coachNote}
              </p>
            </div>
          </div>
          
          <div className="p-6 border-t border-surface-container">
            <button className="w-full py-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-xl transition-colors border border-surface-container-highest">
              End Simulation
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
