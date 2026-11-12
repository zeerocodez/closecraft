'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Search, 
  Clock, 
  Calendar, 
  User, 
  Tag, 
  Sparkles,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorAvatar?: string | null;
  readTimeMinutes: number;
  publishedAt: string | Date | null;
}

interface BlogIndexClientProps {
  initialPosts: BlogPostSummary[];
  categories: string[];
}

export default function BlogIndexClient({ initialPosts, categories }: BlogIndexClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = initialPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

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
              href="/pricing"
              className="text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/services/sales-outsourcing"
              className="hidden sm:inline-block text-xs sm:text-sm text-[#A7B7C7] hover:text-white transition-colors"
            >
              Services
            </Link>
            <Link 
              href="/dss"
              className="text-xs sm:text-sm text-[#45bfae] hover:underline transition-colors font-semibold"
            >
              DSS Academy
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

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(36,130,119,0.12),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#248277]/10 border border-[#248277]/30 text-[#45bfae] text-xs font-semibold uppercase tracking-wider">
            <BookOpen size={13} />
            <span>Revenue Growth & Follow-Up Playbooks</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            The CloseCraft Revenue Journal
          </h1>

          <p className="text-xs sm:text-sm sm:text-base text-[#A7B7C7] max-w-2xl mx-auto leading-relaxed">
            Practical breakdowns on customer acquisition, speed-to-lead execution, high-ticket objection handling, and remote sales operations.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9CAE]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search playbooks, guides, keywords..."
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#0B1117] border border-white/10 text-xs sm:text-sm text-white placeholder:text-[#6A7B8C] focus:outline-none focus:border-[#45bfae] transition-colors shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#248277] text-white shadow-sm'
                    : 'bg-[#0B1117] text-[#8A9CAE] hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-[#0B1117] border border-white/10 space-y-3">
            <BookOpen size={36} className="mx-auto text-[#6A7B8C]" />
            <h3 className="text-base font-bold text-white">No articles found</h3>
            <p className="text-xs text-[#8A9CAE]">
              Try adjusting your search query or switching to another category.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredPost && (
              <div className="rounded-3xl bg-[#0B1117] border border-white/10 overflow-hidden hover:border-[#248277]/40 transition-all shadow-xl group">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#248277]/15 border border-[#248277]/30 text-[#45bfae] text-[11px] font-semibold">
                          {featuredPost.category}
                        </span>
                        <span className="text-[11px] text-[#8A9CAE] flex items-center gap-1">
                          <Clock size={12} />
                          <span>{featuredPost.readTimeMinutes} min read</span>
                        </span>
                      </div>

                      <Link href={`/blog/${featuredPost.slug}`}>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-[#45bfae] transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                      </Link>

                      <p className="text-xs sm:text-sm text-[#8A9CAE] leading-relaxed line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#248277]/20 border border-[#248277]/40 flex items-center justify-center text-xs font-bold text-[#45bfae]">
                          {featuredPost.authorName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">{featuredPost.authorName}</p>
                          <p className="text-[10px] text-[#8A9CAE]">{featuredPost.authorRole}</p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#45bfae] hover:underline"
                      >
                        <span>Read Article</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-gradient-to-br from-[#111C26] to-[#070A0E] p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-white/5">
                    <div className="text-center space-y-2 p-6 rounded-2xl bg-white/5 border border-white/10 max-w-xs">
                      <Sparkles size={28} className="mx-auto text-[#45bfae]" />
                      <p className="text-xs font-bold text-white">Verified Revenue Playbook</p>
                      <p className="text-[11px] text-[#8A9CAE]">Field-tested scripts, benchmark data, and execution frameworks.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Grid */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {regularPosts.map((post) => (
                  <article
                    key={post.id}
                    className="p-6 rounded-2xl bg-[#0B1117] border border-white/10 hover:border-[#248277]/40 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#248277]/10 text-[#45bfae] font-semibold">
                          {post.category}
                        </span>
                        <span className="text-[#8A9CAE] flex items-center gap-1">
                          <Clock size={11} />
                          <span>{post.readTimeMinutes} min</span>
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="text-base font-bold text-white group-hover:text-[#45bfae] transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#8A9CAE] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#8A9CAE]">{post.authorName}</span>
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-[#45bfae] font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Read</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-gradient-to-b from-[#0B1117] to-[#070A0E]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Accelerate Your Sales Pipeline?
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B7C7]">
            Put these playbooks into production with CloseCraft’s automated follow-up engine and certified sales representatives.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#248277] hover:bg-[#1f6f65] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/early-access"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              Apply For Managed Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

