import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.closecrafthq.com';
  const lastModified = new Date();

  // Core public marketing routes
  const staticRoutes: Array<{
    url: string;
    priority: number;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }> = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' },
    { url: '/early-access', priority: 0.95, changeFrequency: 'weekly' },
    { url: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/solutions', priority: 0.85, changeFrequency: 'monthly' },
    { url: '/revenue-engine', priority: 0.85, changeFrequency: 'monthly' },
    { url: '/platform', priority: 0.85, changeFrequency: 'monthly' },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/affiliate', priority: 0.85, changeFrequency: 'weekly' },
    { url: '/blog', priority: 0.85, changeFrequency: 'daily' },

    // Public Service Landing Pages
    { url: '/services/sales-outsourcing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/lead-generation', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/lead-management', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/appointment-setting', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/sales-closing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/sales-training', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/services/dss', priority: 0.9, changeFrequency: 'weekly' },

    // DSS Academy
    { url: '/dss', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/dss/affiliate', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/dss/clinic', priority: 0.8, changeFrequency: 'monthly' },

    // Legal & Terms
    { url: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/terms', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/refund-policy', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/cookies', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/managed-service-terms', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/privacy/request', priority: 0.4, changeFrequency: 'yearly' },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Append published dynamic blog posts
  try {
    const publishedPosts = await db.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      take: 200,
    });

    for (const post of publishedPosts) {
      sitemapEntries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt || lastModified,
        changeFrequency: 'weekly',
        priority: 0.75,
      });
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic blog posts:', error);
  }

  return sitemapEntries;
}
