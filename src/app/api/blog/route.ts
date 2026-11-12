import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'PUBLISHED',
    };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { targetKeyword: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, totalCount, categoriesRaw] = await Promise.all([
      db.blogPost.findMany({
        where,
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
        skip,
        take: limit,
      }),
      db.blogPost.count({ where }),
      db.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    const categories = ['All', ...categoriesRaw.map((c) => c.category).filter(Boolean)];

    return NextResponse.json({
      posts,
      categories,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('[API Blog GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
