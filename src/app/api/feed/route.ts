import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = parseInt(searchParams.get('take') || '20', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    include: {
      author: { include: { profile: true } },
      image: true,
      likes: true,
    },
  });

  return NextResponse.json({
    posts: posts.map(post => ({
      id: post.id,
      imageUrl: post.image?.url || '',
      description: post.description,
      createdAt: post.createdAt,
      author: {
        username: post.author.profile?.username || '',
        name: post.author.profile?.name || '',
        surname: post.author.profile?.surname || '',
        avatar: post.author.profile?.avatarId ? post.author.profile.avatarId : '',
      },
      likesCount: post.likes.length,
    })),
  });
} 