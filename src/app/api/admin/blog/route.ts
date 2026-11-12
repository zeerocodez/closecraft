import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { requireSuperAdmin } from '@/lib/apiSecurity';
import { withApiErrors } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

const BlogPostSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  title: z.string().min(3),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  authorName: z.string().default('CloseCraft Growth Team'),
  authorRole: z.string().default('Revenue Operations'),
  authorAvatar: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).default('PUBLISHED'),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  targetKeyword: z.string().optional().nullable(),
  readTimeMinutes: z.number().int().positive().default(5),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await db.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ posts });
  });
}

export async function POST(req: NextRequest) {
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) {
      return adminCheck.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BlogPostSchema.parse(body);

    const publishedAt = parsed.status === 'PUBLISHED'
      ? (parsed.publishedAt ? new Date(parsed.publishedAt) : new Date())
      : null;

    if (parsed.id) {
      // Update existing post
      const post = await db.blogPost.update({
        where: { id: parsed.id },
        data: {
          slug: parsed.slug,
          title: parsed.title,
          excerpt: parsed.excerpt,
          content: parsed.content,
          coverImage: parsed.coverImage,
          category: parsed.category,
          tags: parsed.tags,
          authorName: parsed.authorName,
          authorRole: parsed.authorRole,
          authorAvatar: parsed.authorAvatar,
          status: parsed.status,
          metaTitle: parsed.metaTitle,
          metaDescription: parsed.metaDescription,
          canonicalUrl: parsed.canonicalUrl,
          targetKeyword: parsed.targetKeyword,
          readTimeMinutes: parsed.readTimeMinutes,
          publishedAt: publishedAt || undefined,
        },
      });

      return NextResponse.json({ success: true, post });
    }

    // Create new post
    const post = await db.blogPost.create({
      data: {
        slug: parsed.slug,
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        coverImage: parsed.coverImage,
        category: parsed.category,
        tags: parsed.tags,
        authorName: parsed.authorName,
        authorRole: parsed.authorRole,
        authorAvatar: parsed.authorAvatar,
        status: parsed.status,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        canonicalUrl: parsed.canonicalUrl,
        targetKeyword: parsed.targetKeyword,
        readTimeMinutes: parsed.readTimeMinutes,
        publishedAt: publishedAt || new Date(),
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  });
}
