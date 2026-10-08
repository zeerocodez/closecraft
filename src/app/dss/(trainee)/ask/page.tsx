'use client';

import React, { useRef, useEffect } from 'react';
// @ts-ignore
import { useChat } from 'ai/react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

export default function AITutorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/dss/ask',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: "Welcome to the DSS AI Tutor. I'm here to help you master B2B SaaS sales. You can ask me about MEDDPICC, objection handling, pricing negotiations, or any part of the curriculum. How can I help you today?"
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#248277]/20 border border-[#248277]/30 flex items-center justify-center text-[#45bfae] shadow-lg">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-white">AI Tutor & Coach</h1>
          <p className="text-sm text-gray-400">Ask questions, roleplay mini-scenarios, or review curriculum concepts.</p>
        </div>
      </div>

      <div className="flex-1 bg-[#121c1a] border border-[#248277]/30 rounded-2xl shadow-xl flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm ${
                m.role === 'user' 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-[#248277]/20 border-[#248277]/40 text-[#45bfae]'
              }`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                m.role === 'user'
                ? 'bg-white/10 text-white rounded-tr-sm border border-white/10'
                : 'bg-[#0a0d12] text-gray-200 rounded-tl-sm border border-[#248277]/20 prose prose-invert prose-sm max-w-none'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                ) : (
                  <p className="leading-relaxed">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#248277]/20 border border-[#248277]/40 text-[#45bfae] flex items-center justify-center shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-[#0a0d12] text-gray-200 rounded-2xl rounded-tl-sm border border-[#248277]/20 p-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#45bfae] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#45bfae] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#45bfae] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0d1117] border-t border-white/5 z-10">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center gap-3">
            <input
              className="flex-1 bg-[#161b22] border border-white/10 rounded-xl py-4 pl-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#45bfae] transition-colors shadow-inner"
              value={input}
              placeholder="Ask about objection handling, MEDDPICC, etc..."
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#45bfae] hover:bg-[#5cd4c3] text-[#0f1214] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-3 font-bold">
            AI Tutor can make mistakes. Verify critical methodologies with the curriculum.
          </div>
        </div>
      </div>
    </div>
  );
}
