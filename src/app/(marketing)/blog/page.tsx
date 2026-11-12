import type { Metadata } from 'next';
import { db } from '@/lib/db';
import BlogIndexClient from './BlogIndexClient';
import JsonLd from '@/components/seo/JsonLd';
import { getBreadcrumbJsonLd } from '@/lib/seo/schema';

export const revalidate = 60; // Refresh cache every minute

export const metadata: Metadata = {
  title: 'The Closecraft Revenue Journal — Sales, Lead Gen & Follow-Up Playbooks',
  description: 'Expert frameworks on customer acquisition, speed-to-lead response, high-ticket objection handling, and remote sales team management.',
  alternates: {
    canonical: 'https://www.closecrafthq.com/blog',
  },
  openGraph: {
    title: 'The Closecraft Revenue Journal — Sales, Lead Gen & Follow-Up Playbooks',
    description: 'Expert frameworks on customer acquisition, speed-to-lead response, high-ticket objection handling, and remote sales team management.',
    url: 'https://www.closecrafthq.com/blog',
    siteName: 'Closecraft',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/closecraft-og.png',
        width: 1200,
        height: 630,
        alt: 'The Closecraft Revenue Journal',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Closecraft Revenue Journal',
    description: 'Practical guides on revenue operations, lead follow-up, and high-ticket closing.',
    images: ['/images/closecraft-og.png'],
    creator: '@closecrafthq',
    site: '@closecrafthq',
  },
};

export default async function BlogIndexPage() {
  let posts: any[] = [];
  let categories: string[] = ['All'];

  try {
    const rawPosts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        authorName: true,
        authorRole: true,
        authorAvatar: true,
        readTimeMinutes: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    posts = rawPosts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    }));

    const distinctCategories = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { category: true },
      distinct: ['category'],
    });

    categories = ['All', ...distinctCategories.map((c) => c.category).filter(Boolean)];
  } catch (error) {
    console.error('[BlogIndexPage] Failed to fetch posts:', error);
  }

  const breadcrumbsSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbsSchema} />
      <BlogIndexClient initialPosts={posts} categories={categories} />
    </>
  );
}
