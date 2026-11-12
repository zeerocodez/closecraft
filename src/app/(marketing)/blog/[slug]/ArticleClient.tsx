'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Share2, 
  Check, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  ShieldCheck,
  Building2,
  TrendingUp
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface ArticleClientProps {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string | null;
    category: string;
    tags: string[];
    authorName: string;
    authorRole: string;
    authorAvatar?: string | null;
    readTimeMinutes: number;
    publishedAt: string | null;
  };
  relatedPosts: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    readTimeMinutes: number;
  }>;
}

export default function ArticleClient({ post, relatedPosts }: ArticleClientProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="min-h-screen bg-[#070A0E] text-white selection:bg-[#248277] selection:text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#070A0E]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="Closecraft Home">
            <Logo variant="full" size="md" alt="Closecraft" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/blog"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              <span>All Articles</span>
            </Link>
            <Link
              href="/early-access"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#248277] hover:bg-[#1f6f65] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Breadcrumb Hierarchy */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#8A9CAE]">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white">Blog</Link>
          <span>/</span>
          <span className="text-[#45bfae] font-medium">{post.category}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#248277]/15 border border-[#248277]/30 text-[#45bfae] text-xs font-semibold uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-xs text-[#8A9CAE] flex items-center gap-1">
              <Clock size={13} />
              <span>{post.readTimeMinutes} min read</span>
            </span>
            <span className="text-xs text-[#8A9CAE] flex items-center gap-1">
              <Calendar size={13} />
              <span>{formattedDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.2]">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-[#A7B7C7] leading-relaxed border-l-2 border-[#248277] pl-4 italic">
            {post.excerpt}
          </p>

          {/* Author Block & Share Button */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-sm font-bold text-[#45bfae]">
                {post.authorName.charAt(0)}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">{post.authorName}</p>
                <p className="text-[11px] text-[#8A9CAE]">{post.authorRole}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#A7B7C7] hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-[#45bfae]" />
                  <span className="text-[#45bfae]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert max-w-none text-[#C5D2E0] text-sm sm:text-base leading-relaxed space-y-6 pt-6 border-t border-white/5">
          {post.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-white pt-4 pb-1">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-bold text-white pt-6 pb-2 border-b border-white/10">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(Boolean);
              return (
                <ul key={idx} className="space-y-2 pl-4 list-disc marker:text-[#45bfae]">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('> ')) {
              return (
                <blockquote key={idx} className="p-4 rounded-xl bg-[#0B1117] border-l-4 border-[#248277] text-white italic text-sm">
                  {paragraph.replace(/^> /, '')}
                </blockquote>
              );
            }
            return (
              <p key={idx} className="text-[#A7B7C7]">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8A9CAE]">Keywords:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-[#A7B7C7]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* High-Converting CTA Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0B1117] to-[#111C26] border border-[#248277]/40 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#248277]/10 text-[#45bfae] text-xs font-semibold">
            <Sparkles size={13} />
            <span>Turn Reading Into Revenue</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Stop Losing Deals to Unassigned and Slow Follow-Up
          </h3>
          <p className="text-xs sm:text-sm text-[#8A9CAE] max-w-xl leading-relaxed">
            CloseCraft combines automated multi-touch follow-up software with certified remote sales professionals trained to book and close your leads.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              href="/early-access"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore Managed Services</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors text-center"
            >
              Start 7-Day Free Trial
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="pt-8 border-t border-white/10 space-y-5">
            <h3 className="text-base font-bold text-white">Related Playbooks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="p-4 rounded-xl bg-[#0B1117] border border-white/10 hover:border-[#248277]/40 transition-colors block space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#8A9CAE]">
                    <span className="text-[#45bfae] font-semibold">{rel.category}</span>
                    <span>{rel.readTimeMinutes} min read</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#45bfae] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
