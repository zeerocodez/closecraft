import React from 'react';
import Link from 'next/link';
import { BookOpen, Mic, CheckCircle, Lock, MessageSquare } from 'lucide-react';

export default function ModuleAssessmentPage() {
  return (
    <div className="max-w-6xl mx-auto w-full p-8 md:p-12 relative">
      <div className="mb-12">
        <Link href="/dss/courses" className="text-[#45bfae] hover:text-[#5cd4c3] text-sm font-bold flex items-center gap-2 mb-6 transition-colors">
          &larr; Back to Curriculum
        </Link>
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#45bfae] bg-[#248277]/10 px-3 py-1.5 rounded-full border border-[#248277]/20 mb-4">
          <BookOpen size={14} /> Module 4 Assessment
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          Objection Handling Roleplay
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          To unlock Module 5, you must successfully navigate this AI buyer roleplay. The AI will evaluate your ability to handle pricing objections using the PAS (Problem-Agitate-Solve) framework.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: The Assessment Interface */}
        <div className="lg:col-span-2">
          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#248277]/20 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#45bfae]/20 flex items-center justify-center text-[#45bfae]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Buyer: Mr. Johnson</h3>
                  <span className="text-xs text-gray-400">VP of Logistics, Acme Corp</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-md animate-pulse">
                Live Session
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
              
              <div className="flex flex-col items-center justify-center mb-6">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest border-b border-gray-800 pb-1">Roleplay Started</span>
              </div>

              {/* Inbound */}
              <div className="flex justify-start">
                <div className="bg-[#1a2624] border border-[#248277]/20 p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-gray-300 text-sm leading-relaxed">
                  "I've looked at the proposal, and honestly, your API SLA looks great. But the price is just way too high compared to what we're currently paying our legacy provider. I can't justify a 40% increase in software costs right now."
                </div>
              </div>

              {/* Outbound (Trainee) */}
              <div className="flex justify-end">
                <div className="bg-[#248277] text-[#0f1214] p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-sm leading-relaxed font-medium">
                  "Mr. Johnson, I completely understand that a 40% increase seems steep on paper. But let's look at the actual cost of your current legacy provider dropping payloads during peak hours. You mentioned last week that the data loss cost you two major enterprise clients last quarter, correct?"
                </div>
              </div>

              {/* Inbound */}
              <div className="flex justify-start">
                <div className="bg-[#1a2624] border border-[#248277]/20 p-4 rounded-2xl rounded-tl-sm max-w-[85%] text-gray-300 text-sm leading-relaxed">
                  "Yes... that's true. Those dropped payloads were a nightmare for our operations team."
                </div>
              </div>

            </div>

            {/* Input Area */}
            <div className="border-t border-[#248277]/20 pt-4 mt-auto">
              <div className="relative">
                <textarea 
                  className="w-full bg-[#0a100f] border border-[#248277]/40 rounded-xl p-4 pr-12 text-gray-200 text-sm focus:outline-none focus:border-[#45bfae] focus:ring-1 focus:ring-[#45bfae] transition-all resize-none"
                  placeholder="Type your response or use the microphone..."
                  rows={3}
                ></textarea>
                <button className="absolute right-3 top-3 p-2 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] rounded-lg transition-colors">
                  <Mic size={18} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500 font-medium">Press <kbd className="bg-gray-800 px-1 py-0.5 rounded text-gray-400 font-mono">Enter</kbd> to send</span>
                <button className="px-6 py-2 bg-[#45bfae] text-[#0f1214] font-bold rounded-lg shadow-[0_0_15px_rgba(69,191,174,0.3)] hover:shadow-[0_0_25px_rgba(69,191,174,0.5)] transition-all">
                  Submit Assessment
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Col: Assessment Status */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#45bfae]/5 rounded-bl-full -z-10"></div>
            <h3 className="text-white font-serif font-bold text-xl mb-4">Rubric & Criteria</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Acknowledge the objection without being defensive.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[#45bfae] shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Agitate the pain of the status quo (dropped payloads).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-[18px] h-[18px] rounded-full border border-gray-600 shrink-0 mt-0.5"></div>
                <span className="text-gray-500 text-sm">Present the higher price as an investment to solve the pain.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#121c1a] border border-[#248277]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Lock size={24} className="text-gray-500" />
            </div>
            <h4 className="text-white font-bold mb-2">Module 5: Closing Strategies</h4>
            <p className="text-sm text-gray-500 mb-4">
              This module is strictly locked. You must achieve a passing grade of 85% or higher on the AI roleplay to gain access.
            </p>
            <button disabled className="w-full py-2 bg-gray-800 text-gray-500 font-bold rounded-lg cursor-not-allowed">
              Locked
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
