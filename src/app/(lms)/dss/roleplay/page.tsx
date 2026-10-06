'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export default function RoleplaySimulation() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'You are now connected to the DSS AI Buyer Simulator.' },
    { id: '2', role: 'assistant', content: 'Hi there, I am Sarah Jenkins, CTO of TechCorp. I was told you wanted to discuss our infrastructure spend. What do you have for me?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/dss/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages.filter(m => m.role !== 'system') })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.reply
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: 'Error: Connection to AI Simulator lost.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full max-w-5xl mx-auto flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
            <h1 className="font-headline-sm text-2xl font-bold text-on-surface">Module 4: Discovery Role-play</h1>
          </div>
          <p className="font-body-sm text-on-surface-variant">
            <strong>Persona:</strong> Sceptical CTO • <strong>Objective:</strong> Uncover 3 pain points without pitching features.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-error text-error rounded-lg font-label-md font-bold hover:bg-error/10 transition-colors">
            End Session early
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md font-bold shadow hover:bg-primary-container transition-colors">
            Submit for Grading
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-inner overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {msg.role === 'system' ? (
                <div className="px-4 py-1 bg-surface-container-high/50 rounded-full text-xs font-label-sm text-on-surface-variant">
                  {msg.content}
                </div>
              ) : (
                <div className={`max-w-[80%] md:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-tertiary text-on-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {msg.role === 'user' ? 'person' : 'robot_2'}
                    </span>
                  </div>
                  
                  {/* Bubble */}
                  <div className={`px-5 py-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface-container text-on-surface rounded-tl-none border border-surface-container-high/30'
                  }`}>
                    <p className="font-body-md whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-[80%] flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-tertiary text-on-primary flex items-center justify-center shrink-0 mt-1">
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  </div>
                  <div className="px-5 py-3 rounded-2xl bg-surface-container text-on-surface rounded-tl-none border border-surface-container-high/30 flex items-center gap-1">
                    <span className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto relative">
            <textarea
              className="flex-1 h-14 min-h-[56px] max-h-32 px-4 py-4 rounded-xl bg-surface-container-lowest text-on-surface font-body-md border border-surface-container-high/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none pr-12"
              placeholder="Type your response to the CTO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 w-10 bg-primary hover:bg-primary-container text-on-primary rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
              Press Enter to send, Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
