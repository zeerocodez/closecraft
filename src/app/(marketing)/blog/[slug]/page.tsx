import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ArticleClient from './ArticleClient';
import JsonLd from '@/components/seo/JsonLd';
import { getArticleJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/schema';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
  });

  if (!post || post.status !== 'PUBLISHED') {
    return {
      title: 'Article Not Found — Closecraft',
      description: 'The requested article could not be located.',
    };
  }

  const title = post.metaTitle || `${post.title} — Closecraft Revenue Journal`;
  const description = post.metaDescription || post.excerpt;
  const url = post.canonicalUrl || `https://www.closecrafthq.com/blog/${post.slug}`;
  const ogImage = post.coverImage || '/images/closecraft-og.png';

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Closecraft',
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.authorName],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@closecrafthq',
      site: '@closecrafthq',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({
    where: { slug },
  });

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  // Fetch 2 related articles in same or other category
  const relatedRaw = await db.blogPost.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: post.id },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      readTimeMinutes: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 2,
  });

  const articleSchema = getArticleJsonLd({
    title: post.title,
    description: post.metaDescription || post.excerpt,
    url: `/blog/${post.slug}`,
    coverImage: post.coverImage || 'https://www.closecrafthq.com/images/closecraft-og.png',
    datePublished: post.publishedAt?.toISOString() || new Date().toISOString(),
    dateModified: post.updatedAt?.toISOString() || new Date().toISOString(),
    authorName: post.authorName,
    authorRole: post.authorRole,
  });

  const breadcrumbsSchema = getBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.category, url: `/blog?category=${encodeURIComponent(post.category)}` },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const clientPost = {
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  };

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbsSchema]} />
      <ArticleClient post={clientPost} relatedPosts={relatedRaw} />
    </>
  );
}
